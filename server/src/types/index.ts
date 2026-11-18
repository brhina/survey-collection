import { Types } from 'mongoose';

export type UserRole = 'admin' | 'creator' | 'respondent';

export interface IUser {
  _id?: Types.ObjectId | string;
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export type CollectorCategory =
  | 'survey'
  | 'registration'
  | 'feedback'
  | 'inspection'
  | 'application'
  | 'general';

export type QuestionType =
  | 'text'
  | 'long-text'
  | 'multiple-choice'
  | 'rating'
  | 'checkbox'
  | 'dropdown'
  | 'likert'
  | 'nps'
  | 'date'
  | 'number'
  | 'email'
  | 'phone';

export type SurveyStatus = 'draft' | 'published' | 'closed' | 'archived';

export interface IQuestionValidation {
  minLength?: number;
  maxLength?: number;
  minSelections?: number;
  maxSelections?: number;
  minRating?: number;
  maxRating?: number;
}

export interface ILogicJump {
  triggerOption: string;
  action: 'skip_to_question' | 'end_survey';
  targetQuestionId?: Types.ObjectId | string;
}

export interface IQuestion {
  _id?: Types.ObjectId | string;
  type: QuestionType;
  questionText: string;
  description?: string;
  options?: string[];
  isRequired: boolean;
  order: number;
  validation?: IQuestionValidation;
  logicJumps?: ILogicJump[];
}

export interface ISurveySettings {
  isAnonymous?: boolean;
  allowMultipleSubmissions?: boolean;
  requireAuth?: boolean;
  accessCode?: string;
  responseLimit?: number | null;
  opensAt?: Date | null;
  closesAt?: Date | null;
}

export interface ISurvey {
  _id?: Types.ObjectId | string;
  title: string;
  description: string;
  category?: CollectorCategory;
  creatorId?: Types.ObjectId | IUser | string;
  status: SurveyStatus;
  settings?: ISurveySettings;
  questions: IQuestion[];
  responseCount: number;
  createdAt?: Date;
  updatedAt?: Date;
  isActive: boolean;
}

export interface IAnswer {
  questionId: Types.ObjectId | string;
  questionType?: QuestionType;
  answer: string | string[] | number | boolean;
}

export interface IResponse {
  _id?: Types.ObjectId | string;
  surveyId: Types.ObjectId | ISurvey | string;
  respondentEmail: string;
  respondentId?: Types.ObjectId | IUser | string | null;
  respondentHash?: string | null;
  answers: IAnswer[];
  completionTimeSeconds?: number;
  submittedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IQuestionAnalysis {
  questionId: Types.ObjectId | string;
  questionText: string;
  type: QuestionType;
  totalResponses: number;
  averageRating?: number;
  optionCounts?: Record<string, number>;
  responses?: unknown[];
}

export interface ISurveyResults {
  surveyId: string;
  totalResponses: number;
  results: IQuestionAnalysis[];
}

export interface PaginationParams {
  page: number;
  limit: number;
  status?: SurveyStatus;
  category?: CollectorCategory;
  search?: string;
  creatorId?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
