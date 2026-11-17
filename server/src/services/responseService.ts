import crypto from 'crypto';
import { Types } from 'mongoose';
import surveyRepository from '../repositories/surveyRepository';
import responseRepository from '../repositories/responseRepository';
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from '../errors';
import { SubmitResponseInput } from '../schemas/responseSchema';
import { IAnswer, IAuthUser, IQuestion, IResponse, ISurveyResults, PaginatedResult } from '../types';

export class ResponseService {
  private generateHash(clientIp?: string, userAgent?: string): string {
    const raw = `${clientIp || ''}::${userAgent || ''}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  private validateAnswers(questions: IQuestion[], submittedAnswers: IAnswer[]): IAnswer[] {
    const questionMap = new Map<string, IQuestion>();
    questions.forEach((q) => {
      if (q._id) {
        questionMap.set(q._id.toString(), q);
      }
    });

    const submittedMap = new Map<string, unknown>();
    submittedAnswers.forEach((ans) => {
      submittedMap.set(ans.questionId.toString(), ans.answer);
    });

    // 1. Required questions check
    for (const question of questions) {
      const qIdStr = question._id ? question._id.toString() : '';
      if (question.isRequired) {
        const val = submittedMap.get(qIdStr);
        const isEmpty =
          val === undefined ||
          val === null ||
          val === '' ||
          (Array.isArray(val) && val.length === 0);

        if (isEmpty) {
          throw new BadRequestError(`Question "${question.questionText}" is required`);
        }
      }
    }

    // 2. Type and options validation
    const sanitizedAnswers: IAnswer[] = [];

    for (const ans of submittedAnswers) {
      const question = questionMap.get(ans.questionId.toString());
      if (!question) {
        continue;
      }

      const val = ans.answer;

      if (['multiple-choice', 'dropdown'].includes(question.type)) {
        if (typeof val === 'string' && val.trim() !== '') {
          if (question.options && !question.options.includes(val)) {
            throw new BadRequestError(`"${val}" is not a valid option for "${question.questionText}"`);
          }
        }
      } else if (question.type === 'checkbox') {
        if (Array.isArray(val)) {
          if (question.options) {
            for (const item of val) {
              if (!question.options.includes(item)) {
                throw new BadRequestError(`"${item}" is not a valid option for "${question.questionText}"`);
              }
            }
          }
        }
      } else if (question.type === 'rating' || question.type === 'nps') {
        if (val !== undefined && val !== null && val !== '') {
          const num = Number(val);
          const min = question.validation?.minRating ?? (question.type === 'nps' ? 0 : 1);
          const max = question.validation?.maxRating ?? (question.type === 'nps' ? 10 : 5);
          if (isNaN(num) || num < min || num > max) {
            throw new BadRequestError(`Rating for "${question.questionText}" must be between ${min} and ${max}`);
          }
        }
      }

      sanitizedAnswers.push({
        questionId: new Types.ObjectId(ans.questionId),
        questionType: question.type,
        answer: val
      });
    }

    return sanitizedAnswers;
  }

  async submitResponse(
    input: SubmitResponseInput,
    user?: IAuthUser,
    clientIp?: string,
    userAgent?: string
  ): Promise<IResponse> {
    if (!Types.ObjectId.isValid(input.surveyId)) {
      throw new NotFoundError('Survey not found or inactive');
    }

    const survey = await surveyRepository.findById(input.surveyId);
    if (!survey || !survey.isActive) {
      throw new NotFoundError('Survey not found or inactive');
    }

    if (survey.status === 'draft') {
      throw new BadRequestError('This survey is a draft and cannot accept responses');
    }

    if (survey.status === 'closed' || survey.status === 'archived') {
      throw new BadRequestError('This survey is closed');
    }

    const now = new Date();
    if (survey.settings?.opensAt && new Date(survey.settings.opensAt) > now) {
      throw new BadRequestError('This survey has not opened yet');
    }

    if (survey.settings?.closesAt && new Date(survey.settings.closesAt) < now) {
      throw new BadRequestError('This survey has expired');
    }

    if (survey.settings?.requireAuth && !user) {
      throw new UnauthorizedError('Authentication is required to participate in this survey');
    }

    const respondentHash = this.generateHash(clientIp, userAgent);

    // Prevent duplicate submissions if configured
    if (!survey.settings?.allowMultipleSubmissions) {
      const existing = await responseRepository.findExistingSubmission({
        surveyId: survey._id ? survey._id.toString() : input.surveyId,
        respondentId: user?.id,
        respondentHash
      });

      if (existing) {
        throw new ConflictError('You have already submitted a response to this survey');
      }
    }

    // Validate answers against questions
    const validatedAnswers = this.validateAnswers(survey.questions, input.answers as IAnswer[]);

    const response = await responseRepository.create({
      surveyId: survey._id,
      respondentId: survey.settings?.isAnonymous ? null : (user ? new Types.ObjectId(user.id) : null),
      respondentHash: survey.settings?.isAnonymous ? null : respondentHash,
      answers: validatedAnswers,
      completionTimeSeconds: input.completionTimeSeconds || 0,
      submittedAt: new Date()
    });

    if (survey._id) {
      await surveyRepository.incrementResponseCount(survey._id);
    }

    return response;
  }

  async getSurveyResults(surveyId: string): Promise<ISurveyResults> {
    if (!Types.ObjectId.isValid(surveyId)) {
      throw new NotFoundError('Survey not found');
    }

    const survey = await surveyRepository.findById(surveyId);
    if (!survey) {
      throw new NotFoundError('Survey not found');
    }

    return responseRepository.calculateSurveyResults(surveyId, survey.questions);
  }

  async getSurveyResponses(
    surveyId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResult<IResponse>> {
    if (!Types.ObjectId.isValid(surveyId)) {
      throw new NotFoundError('Survey not found');
    }

    const survey = await surveyRepository.findById(surveyId);
    if (!survey) {
      throw new NotFoundError('Survey not found');
    }

    return responseRepository.findBySurveyId(surveyId, page, limit);
  }
}

export const responseService = new ResponseService();
export default responseService;
