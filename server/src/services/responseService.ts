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
      } else if (question.type === 'number') {
        if (val !== undefined && val !== null && val !== '') {
          const num = Number(val);
          if (isNaN(num)) {
            throw new BadRequestError(`"${question.questionText}" requires a valid number`);
          }
        }
      } else if (question.type === 'email') {
        if (typeof val === 'string' && val.trim() !== '') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(val.trim())) {
            throw new BadRequestError(`"${val}" is not a valid email address for "${question.questionText}"`);
          }
        }
      } else if (question.type === 'date') {
        if (val !== undefined && val !== null && val !== '') {
          if (isNaN(Date.parse(String(val)))) {
            throw new BadRequestError(`"${val}" is not a valid date for "${question.questionText}"`);
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

    // 1. Resolve and validate respondent email (Required for 1-user-1-submission uniqueness)
    const effectiveEmail = (user?.email || input.respondentEmail || '').trim().toLowerCase();
    if (!effectiveEmail) {
      throw new BadRequestError('Respondent email is required to record data uniquely.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(effectiveEmail)) {
      throw new BadRequestError('A valid email address is required (e.g. user@example.com).');
    }

    const respondentHash = this.generateHash(clientIp, userAgent);

    // 2. Strict Uniqueness Check: One submission per email account is strictly enforced
    const existingSubmission = await responseRepository.findExistingSubmission({
      surveyId: survey._id ? survey._id.toString() : input.surveyId,
      respondentEmail: effectiveEmail,
      respondentId: user?.id
    });

    if (existingSubmission) {
      throw new ConflictError(
        `A submission from "${effectiveEmail}" has already been recorded for this data collector. One email account cannot submit more than once.`
      );
    }

    // Validate answers against questions
    const validatedAnswers = this.validateAnswers(survey.questions, input.answers as IAnswer[]);

    let response: IResponse;
    try {
      response = await responseRepository.create({
        surveyId: survey._id,
        respondentEmail: effectiveEmail,
        respondentId: survey.settings?.isAnonymous ? null : (user ? new Types.ObjectId(user.id) : null),
        respondentHash: survey.settings?.isAnonymous ? null : respondentHash,
        answers: validatedAnswers,
        completionTimeSeconds: input.completionTimeSeconds || 0,
        submittedAt: new Date()
      });
    } catch (err: unknown) {
      const mongoErr = err as { code?: number; name?: string };
      if (mongoErr && (mongoErr.code === 11000 || mongoErr.name === 'MongoServerError')) {
        throw new ConflictError(
          `A submission from "${effectiveEmail}" has already been recorded for this data collector. One email account cannot submit more than once.`
        );
      }
      throw err;
    }

    if (survey._id) {
      await surveyRepository.incrementResponseCount(survey._id);
    }

    return response;
  }

  async checkEligibility(surveyId: string, email: string): Promise<{
    eligible: boolean;
    message: string;
    email: string;
    surveyId: string;
  }> {
    if (!Types.ObjectId.isValid(surveyId)) {
      throw new NotFoundError('Data collector not found');
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      throw new BadRequestError('Please provide a valid email address');
    }

    const survey = await surveyRepository.findById(surveyId);
    if (!survey || !survey.isActive) {
      throw new NotFoundError('Data collector not found or inactive');
    }

    const existing = await responseRepository.findBySurveyAndEmail(surveyId, cleanEmail);
    if (existing) {
      return {
        eligible: false,
        message: `A submission has already been recorded for "${cleanEmail}". Each user can only fill this once.`,
        email: cleanEmail,
        surveyId
      };
    }

    return {
      eligible: true,
      message: `"${cleanEmail}" is eligible to submit data.`,
      email: cleanEmail,
      surveyId
    };
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
