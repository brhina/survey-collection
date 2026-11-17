import mongoose, { Schema } from 'mongoose';
import { IQuestion, ISurvey } from '../types';

const questionSchema = new Schema<IQuestion>({
  type: {
    type: String,
    enum: ['text', 'multiple-choice', 'rating', 'checkbox'],
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: function(this: IQuestion) {
      return ['multiple-choice', 'checkbox'].includes(this.type);
    }
  }],
  isRequired: {
    type: Boolean,
    default: true
  }
});

const surveySchema = new Schema<ISurvey>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  questions: [questionSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

export const Survey = mongoose.model<ISurvey>('Survey', surveySchema);
export default Survey;
