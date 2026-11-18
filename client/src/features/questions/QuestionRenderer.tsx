import React from 'react';
import { Question } from '../../types';
import TextQuestion from './types/TextQuestion';
import MultipleChoiceQuestion from './types/MultipleChoiceQuestion';
import CheckboxQuestion from './types/CheckboxQuestion';
import RatingQuestion from './types/RatingQuestion';
import DropdownQuestion from './types/DropdownQuestion';

export interface QuestionRendererProps {
  question: Question;
  value: unknown;
  onChange: (val: unknown) => void;
  disabled?: boolean;
}

const REGISTRY: Record<string, React.FC<QuestionRendererProps>> = {
  text: TextQuestion,
  'long-text': TextQuestion,
  number: TextQuestion,
  email: TextQuestion,
  phone: TextQuestion,
  date: TextQuestion,
  'multiple-choice': MultipleChoiceQuestion,
  checkbox: CheckboxQuestion,
  rating: RatingQuestion,
  dropdown: DropdownQuestion
};

export const QuestionRenderer: React.FC<QuestionRendererProps> = (props) => {
  const Component = REGISTRY[props.question.type] || TextQuestion;
  return <Component {...props} />;
};

export default QuestionRenderer;
