import { Types } from 'mongoose';
import surveyRepository from '../repositories/surveyRepository';
import { ForbiddenError, NotFoundError, BadRequestError } from '../errors';
import { CreateSurveyInput, SurveyQueryInput, UpdateSurveyInput } from '../schemas/surveySchema';
import { IAuthUser, IQuestion, ISurvey, PaginatedResult } from '../types';

export class SurveyService {
  async createSurvey(input: CreateSurveyInput, user?: IAuthUser): Promise<ISurvey> {
    const formattedQuestions: IQuestion[] = input.questions.map((q, idx) => ({
      ...q,
      order: q.order !== undefined && q.order !== null ? q.order : idx,
      options: ['multiple-choice', 'checkbox', 'dropdown'].includes(q.type)
        ? (q.options || []).filter(opt => opt && opt.trim().length > 0)
        : []
    }));

    const surveyPayload: Partial<ISurvey> = {
      title: input.title,
      description: input.description,
      status: input.status || 'published',
      settings: input.settings || {
        isAnonymous: false,
        allowMultipleSubmissions: false,
        requireAuth: false
      },
      questions: formattedQuestions,
      creatorId: user ? new Types.ObjectId(user.id) : undefined
    };

    return surveyRepository.create(surveyPayload);
  }

  async getSurveys(query: SurveyQueryInput, user?: IAuthUser): Promise<PaginatedResult<ISurvey> | ISurvey[]> {
    if (query.all) {
      return surveyRepository.findAllActive();
    }

    return surveyRepository.findWithPagination({
      page: query.page,
      limit: query.limit,
      status: query.status,
      search: query.search,
      creatorId: user && user.role !== 'admin' ? user.id : undefined
    });
  }

  async getSurveyById(id: string): Promise<ISurvey> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundError('Survey not found');
    }

    const survey = await surveyRepository.findById(id);
    if (!survey) {
      throw new NotFoundError('Survey not found');
    }
    return survey;
  }

  async getPublicSurvey(id: string): Promise<ISurvey> {
    const survey = await this.getSurveyById(id);

    if (survey.status === 'draft') {
      throw new BadRequestError('This survey is currently a draft and is not accepting responses');
    }

    if (survey.status === 'closed' || survey.status === 'archived') {
      throw new BadRequestError('This survey is closed');
    }

    const now = new Date();
    if (survey.settings?.opensAt && new Date(survey.settings.opensAt) > now) {
      throw new BadRequestError('This survey has not opened yet');
    }

    if (survey.settings?.closesAt && new Date(survey.settings.closesAt) < now) {
      throw new BadRequestError('This survey has expired and is no longer accepting responses');
    }

    if (
      survey.settings?.responseLimit &&
      survey.responseCount >= survey.settings.responseLimit
    ) {
      throw new BadRequestError('This survey has reached its maximum response capacity');
    }

    return survey;
  }

  async updateSurvey(
    id: string,
    input: UpdateSurveyInput,
    user?: IAuthUser
  ): Promise<ISurvey> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundError('Survey not found');
    }

    const existing = await surveyRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Survey not found');
    }

    if (
      user &&
      user.role !== 'admin' &&
      existing.creatorId &&
      existing.creatorId.toString() !== user.id
    ) {
      throw new ForbiddenError('You do not have permission to modify this survey');
    }

    const updatePayload: Partial<ISurvey> = {};
    if (input.title) updatePayload.title = input.title;
    if (input.description) updatePayload.description = input.description;
    if (input.status) updatePayload.status = input.status;
    if (input.settings) updatePayload.settings = input.settings;

    if (input.questions) {
      updatePayload.questions = input.questions.map((q, idx) => ({
        ...q,
        order: q.order !== undefined && q.order !== null ? q.order : idx,
        options: ['multiple-choice', 'checkbox', 'dropdown'].includes(q.type)
          ? (q.options || []).filter(opt => opt && opt.trim().length > 0)
          : []
      }));
    }

    const updated = await surveyRepository.update(id, updatePayload);
    if (!updated) {
      throw new NotFoundError('Survey not found');
    }

    return updated;
  }

  async deleteSurvey(id: string, user?: IAuthUser): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundError('Survey not found');
    }

    const existing = await surveyRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Survey not found');
    }

    if (
      user &&
      user.role !== 'admin' &&
      existing.creatorId &&
      existing.creatorId.toString() !== user.id
    ) {
      throw new ForbiddenError('You do not have permission to delete this survey');
    }

    await surveyRepository.softDelete(id);
  }
}

export const surveyService = new SurveyService();
export default surveyService;
