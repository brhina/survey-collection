import mongoose, { Types } from 'mongoose';
import Response from '../models/Response';
import { IQuestion, IQuestionAnalysis, IResponse, ISurveyResults, PaginatedResult } from '../types';

export class ResponseRepository {
  async create(data: Partial<IResponse>): Promise<IResponse> {
    const response = await Response.create(data);
    return response.toObject();
  }

  async findExistingSubmission(params: {
    surveyId: string | Types.ObjectId;
    respondentEmail?: string | null;
    respondentId?: string | Types.ObjectId | null;
    respondentHash?: string | null;
  }): Promise<IResponse | null> {
    const { surveyId, respondentEmail, respondentId, respondentHash } = params;

    const conditions: Array<Record<string, unknown>> = [];
    const sId = new Types.ObjectId(surveyId);

    if (respondentEmail) {
      conditions.push({ surveyId: sId, respondentEmail: respondentEmail.trim().toLowerCase() });
    }

    if (respondentId) {
      conditions.push({ surveyId: sId, respondentId: new Types.ObjectId(respondentId) });
    }

    if (respondentHash && !respondentEmail && !respondentId) {
      conditions.push({ surveyId: sId, respondentHash });
    }

    if (conditions.length === 0) {
      return null;
    }

    return Response.findOne({ $or: conditions }).lean();
  }

  async findBySurveyAndEmail(
    surveyId: string | Types.ObjectId,
    email: string
  ): Promise<IResponse | null> {
    return Response.findOne({
      surveyId: new Types.ObjectId(surveyId),
      respondentEmail: email.trim().toLowerCase()
    }).lean();
  }

  async findBySurveyId(
    surveyId: string | Types.ObjectId,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResult<IResponse>> {
    const sId = new Types.ObjectId(surveyId);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Response.find({ surveyId: sId })
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('respondentId', 'name email')
        .lean(),
      Response.countDocuments({ surveyId: sId })
    ]);

    return {
      data,
      total,
      page,
      limit
    };
  }

  async findAllBySurveyIdRaw(surveyId: string | Types.ObjectId): Promise<IResponse[]> {
    return Response.find({ surveyId: new Types.ObjectId(surveyId) })
      .sort({ submittedAt: -1 })
      .lean();
  }

  async calculateSurveyResults(
    surveyId: string | Types.ObjectId,
    questions: IQuestion[]
  ): Promise<ISurveyResults> {
    const sId = new Types.ObjectId(surveyId);

    // Total survey responses count
    const totalResponses = await Response.countDocuments({ surveyId: sId });

    if (totalResponses === 0) {
      return {
        surveyId: sId.toString(),
        totalResponses: 0,
        results: questions.map((q) => ({
          questionId: q._id ? q._id.toString() : '',
          questionText: q.questionText,
          type: q.type,
          totalResponses: 0,
          ...(q.type === 'rating' || q.type === 'nps' ? { averageRating: 0 } : {}),
          ...(['multiple-choice', 'checkbox', 'dropdown'].includes(q.type)
            ? { optionCounts: (q.options || []).reduce((acc, opt) => ({ ...acc, [opt]: 0 }), {}) }
            : {}),
          ...(q.type === 'text' || q.type === 'long-text' ? { responses: [] } : {})
        }))
      };
    }

    // High performance MongoDB Aggregation Pipeline
    const aggregatedResults = await Response.aggregate([
      { $match: { surveyId: sId } },
      { $unwind: '$answers' },
      {
        $group: {
          _id: '$answers.questionId',
          totalAnswers: { $sum: 1 },
          answers: { $push: '$answers.answer' }
        }
      }
    ]);

    const aggregateMap = new Map<string, { totalAnswers: number; answers: unknown[] }>();
    for (const item of aggregatedResults) {
      if (item._id) {
        aggregateMap.set(item._id.toString(), {
          totalAnswers: item.totalAnswers,
          answers: item.answers
        });
      }
    }

    const questionResults: IQuestionAnalysis[] = questions.map((question) => {
      const qIdStr = question._id ? question._id.toString() : '';
      const aggregated = aggregateMap.get(qIdStr);
      const rawAnswers = aggregated ? aggregated.answers : [];

      const analysis: IQuestionAnalysis = {
        questionId: qIdStr,
        questionText: question.questionText,
        type: question.type,
        totalResponses: aggregated ? aggregated.totalAnswers : 0
      };

      switch (question.type) {
        case 'rating':
        case 'nps': {
          const numbers = rawAnswers
            .map((val) => Number(val))
            .filter((num) => !isNaN(num));

          analysis.averageRating =
            numbers.length > 0
              ? Number((numbers.reduce((acc, curr) => acc + curr, 0) / numbers.length).toFixed(2))
              : 0;
          break;
        }

        case 'multiple-choice':
        case 'dropdown':
        case 'checkbox': {
          const optionCounts: Record<string, number> = {};
          (question.options || []).forEach((opt) => {
            optionCounts[opt] = 0;
          });

          rawAnswers.forEach((ans) => {
            if (Array.isArray(ans)) {
              ans.forEach((subAns) => {
                const key = String(subAns);
                optionCounts[key] = (optionCounts[key] || 0) + 1;
              });
            } else if (ans !== null && ans !== undefined) {
              const key = String(ans);
              optionCounts[key] = (optionCounts[key] || 0) + 1;
            }
          });

          analysis.optionCounts = optionCounts;
          break;
        }

        case 'text':
        case 'long-text':
        case 'date': {
          analysis.responses = rawAnswers.filter((a) => a !== null && a !== undefined && a !== '');
          break;
        }

        default:
          analysis.responses = rawAnswers;
          break;
      }

      return analysis;
    });

    return {
      surveyId: sId.toString(),
      totalResponses,
      results: questionResults
    };
  }
}

export const responseRepository = new ResponseRepository();
export default responseRepository;
