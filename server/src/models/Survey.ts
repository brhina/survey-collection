import mongoose, { Schema } from 'mongoose';
import { IQuestion, ISurvey } from '../types';

const questionSchema = new Schema<IQuestion>({
  type: {
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
    ],
    required: true
  },
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  options: [{
    type: String,
    trim: true
  }],
  isRequired: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  validation: {
    minLength: Number,
    maxLength: Number,
    minSelections: Number,
    maxSelections: Number,
    minRating: { type: Number, default: 1 },
    maxRating: { type: Number, default: 5 }
  },
  logicJumps: [{
    triggerOption: String,
    action: { type: String, enum: ['skip_to_question', 'end_survey'] },
    targetQuestionId: { type: Schema.Types.ObjectId }
  }]
});

const surveySchema = new Schema<ISurvey>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'closed', 'archived'],
      default: 'published',
      index: true
    },
    settings: {
      isAnonymous: { type: Boolean, default: false },
      allowMultipleSubmissions: { type: Boolean, default: false },
      requireAuth: { type: Boolean, default: false },
      accessCode: { type: String, select: false },
      responseLimit: { type: Number, default: null },
      opensAt: { type: Date, default: null },
      closesAt: { type: Date, default: null }
    },
    questions: [questionSchema],
    responseCount: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index for listing active and published surveys efficiently
surveySchema.index({ isActive: 1, status: 1, createdAt: -1 });

export const Survey = mongoose.model<ISurvey>('Survey', surveySchema);
export default Survey;
