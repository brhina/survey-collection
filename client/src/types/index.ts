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
  | 'checkbox'
  | 'rating'
  | 'dropdown'
  | 'likert'
  | 'nps'
  | 'date'
  | 'number'
  | 'email'
  | 'phone';

export type SurveyStatus = 'draft' | 'published' | 'closed' | 'archived';

export interface QuestionValidation {
  minLength?: number;
  maxLength?: number;
  minSelections?: number;
  maxSelections?: number;
  minRating?: number;
  maxRating?: number;
}

export interface Question {
  _id?: string;
  type: QuestionType;
  questionText: string;
  description?: string;
  options?: string[];
  isRequired: boolean;
  order?: number;
  validation?: QuestionValidation;
}

export interface SurveySettings {
  isAnonymous?: boolean;
  allowMultipleSubmissions?: boolean;
  requireAuth?: boolean;
  responseLimit?: number | null;
  opensAt?: string | null;
  closesAt?: string | null;
}

export interface Survey {
  _id: string;
  title: string;
  description: string;
  category?: CollectorCategory;
  status?: SurveyStatus;
  settings?: SurveySettings;
  questions: Question[];
  responseCount?: number;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

export interface CreateSurveyData {
  title: string;
  description: string;
  category?: CollectorCategory;
  status?: SurveyStatus;
  settings?: SurveySettings;
  questions: Question[];
}

export interface AnswerItem {
  questionId: string;
  questionType?: QuestionType;
  answer: string | string[] | number | boolean;
}

export interface QuestionAnalysis {
  questionId: string;
  questionText: string;
  type: QuestionType;
  totalResponses: number;
  averageRating?: number;
  optionCounts?: Record<string, number>;
  responses?: string[];
}

export interface SurveyResultsData {
  surveyId: string;
  totalResponses: number;
  results: QuestionAnalysis[];
}

export interface RawResponseRecord {
  _id: string;
  surveyId: string;
  respondentEmail?: string;
  respondentId?: {
    _id?: string;
    name?: string;
    email?: string;
  } | null;
  submittedAt: string;
  completionTimeSeconds?: number;
  answers: {
    questionId: string;
    questionType?: string;
    answer: unknown;
  }[];
}
