import mongoose, { Schema } from 'mongoose';
import { IAnswer, IResponse } from '../types';

const answerSchema = new Schema<IAnswer>(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      required: true
    },
    questionType: {
      type: String,
      enum: [
        'text',
        'long-text',
        'multiple-choice',
        'checkbox',
        'rating',
        'likert',
        'dropdown',
        'nps',
        'date'
      ]
    },
    answer: {
      type: Schema.Types.Mixed,
      required: true
    }
  },
  { _id: false }
);

const responseSchema = new Schema<IResponse>(
  {
    surveyId: {
      type: Schema.Types.ObjectId,
      ref: 'Survey',
      required: true,
      index: true
    },
    respondentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    respondentHash: {
      type: String,
      default: null,
      index: true
    },
    answers: [answerSchema],
    completionTimeSeconds: {
      type: Number,
      min: 0,
      default: 0
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for lookup and duplicate checking
responseSchema.index({ surveyId: 1, submittedAt: -1 });
responseSchema.index({ surveyId: 1, respondentId: 1 });
responseSchema.index({ surveyId: 1, respondentHash: 1 });

export const Response = mongoose.model<IResponse>('Response', responseSchema);
export default Response;
