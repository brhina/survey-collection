import { Types } from 'mongoose';

export type QuestionType = 'text' | 'multiple-choice' | 'rating' | 'checkbox';

export interface IQuestion {
  _id?: Types.ObjectId;
  type: QuestionType;
  questionText: string;
  options?: string[];
  isRequired: boolean;
}

export interface ISurvey {
  _id?: Types.ObjectId;
  title: string;
  description: string;
  questions: IQuestion[];
  createdAt?: Date;
  isActive: boolean;
}

export interface IAnswer {
  questionId: Types.ObjectId | string;
  answer: string | string[] | number | boolean;
}

export interface IResponse {
  _id?: Types.ObjectId;
  surveyId: Types.ObjectId | ISurvey;
  answers: IAnswer[];
  submittedAt?: Date;
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
