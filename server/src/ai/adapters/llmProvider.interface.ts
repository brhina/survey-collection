import { IAiCollectorAnalysis } from '../schemas/aiAnalysisSchema';
import { PreparedCollectorContext } from '../pipeline/contextBuilder';

export interface ProviderGenerateOptions {
  temperature?: number;
  maxTokens?: number;
  categoryRubric?: string;
  onStreamPhase?: (phase: string, message: string) => void;
  onStreamToken?: (token: string) => void;
}

export interface ILlmProvider {
  readonly name: string;
  isAvailable(): boolean;
  generateAnalysis(
    context: PreparedCollectorContext,
    options?: ProviderGenerateOptions
  ): Promise<{
    analysis: IAiCollectorAnalysis;
    tokenUsage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  }>;
  chatWithData(
    context: PreparedCollectorContext,
    userQuestion: string,
    history: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
  ): Promise<string>;
}
