export type QuestionType = 'text' | 'multiple-choice' | 'rating' | 'checkbox';

export interface Question {
  _id?: string;
  type: QuestionType;
  questionText: string;
  options: string[];
  isRequired: boolean;
}

export interface Survey {
  _id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt?: string;
  isActive?: boolean;
}

export interface CreateSurveyData {
  title: string;
  description: string;
  questions: Question[];
}

export interface AnswerItem {
  questionId: string;
  answer: string | string[];
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
