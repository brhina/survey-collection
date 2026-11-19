import mongoose, { Schema, Document, Types } from 'mongoose';
import { IAiCollectorAnalysis } from '../ai/schemas/aiAnalysisSchema';

export interface IHumanOverride {
  overriddenBy: Types.ObjectId | string;
  originalDecision: string;
  newDecision: string;
  overrideReason: string;
  overriddenAt: Date;
}

export interface IAiAnalysisDoc extends Document {
  surveyId: Types.ObjectId;
  collectorCategory: string;
  responseCountAtAnalysis: number;
  cacheHash: string;
  analysis: IAiCollectorAnalysis;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  modelName: string;
  provider: string;
  humanOverride?: IHumanOverride;
  createdAt: Date;
  updatedAt: Date;
}

const aiAnalysisSchema = new Schema<IAiAnalysisDoc>(
  {
    surveyId: {
      type: Schema.Types.ObjectId,
      ref: 'Survey',
      required: true,
      index: true
    },
    collectorCategory: {
      type: String,
      required: true,
      index: true
    },
    responseCountAtAnalysis: {
      type: Number,
      required: true,
      default: 0
    },
    cacheHash: {
      type: String,
      required: true
    },
    analysis: {
      type: Schema.Types.Mixed,
      required: true
    },
    tokenUsage: {
      promptTokens: { type: Number, default: 0 },
      completionTokens: { type: Number, default: 0 },
      totalTokens: { type: Number, default: 0 }
    },
    modelName: {
      type: String,
      required: true,
      default: 'gemini-1.5-pro'
    },
    provider: {
      type: String,
      required: true,
      default: 'heuristic'
    },
    humanOverride: {
      overriddenBy: { type: Schema.Types.ObjectId, ref: 'User' },
      originalDecision: { type: String },
      newDecision: { type: String },
      overrideReason: { type: String },
      overriddenAt: { type: Date }
    }
  },
  {
    timestamps: true
  }
);

aiAnalysisSchema.index({ surveyId: 1, createdAt: -1 });
aiAnalysisSchema.index({ cacheHash: 1 });

export const AiAnalysis = mongoose.model<IAiAnalysisDoc>('AiAnalysis', aiAnalysisSchema);
export default AiAnalysis;
