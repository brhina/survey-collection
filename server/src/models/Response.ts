import mongoose, { Schema } from 'mongoose';
import { IAnswer, IResponse } from '../types';

const answerSchema = new Schema<IAnswer>({
  questionId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  answer: {
    type: Schema.Types.Mixed,
    required: true
  }
});

const responseSchema = new Schema<IResponse>({
  surveyId: {
    type: Schema.Types.ObjectId,
    ref: 'Survey',
    required: true
  },
  answers: [answerSchema],
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

export const Response = mongoose.model<IResponse>('Response', responseSchema);
export default Response;
