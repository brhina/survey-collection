import { ILlmProvider } from './llmProvider.interface';
import GeminiProvider from './geminiProvider';
import OpenAiProvider from './openAiProvider';
import HeuristicProvider from './heuristicProvider';
import { env } from '../../config/env';

export class ProviderFactory {
  private static instanceCache: Map<string, ILlmProvider> = new Map();

  /**
   * Returns an active LLM provider based on system config or explicit selection.
   */
  public static getProvider(preferred?: string): ILlmProvider {
    const target = preferred || env.AI_PROVIDER || 'auto';

    if (this.instanceCache.has(target)) {
      return this.instanceCache.get(target)!;
    }

    let provider: ILlmProvider;

    if (target === 'gemini') {
      const gemini = new GeminiProvider();
      provider = gemini.isAvailable() ? gemini : new HeuristicProvider();
    } else if (target === 'openai') {
      const openAi = new OpenAiProvider();
      provider = openAi.isAvailable() ? openAi : new HeuristicProvider();
    } else if (target === 'heuristic') {
      provider = new HeuristicProvider();
    } else {
      // 'auto' mode: check available API keys in order of preference
      const gemini = new GeminiProvider();
      if (gemini.isAvailable()) {
        provider = gemini;
      } else {
        const openAi = new OpenAiProvider();
        if (openAi.isAvailable()) {
          provider = openAi;
        } else {
          provider = new HeuristicProvider();
        }
      }
    }

    this.instanceCache.set(target, provider);
    return provider;
  }
}

export default ProviderFactory;
