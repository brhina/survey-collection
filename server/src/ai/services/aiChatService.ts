import { Types } from 'mongoose';
import surveyRepository from '../../repositories/surveyRepository';
import responseRepository from '../../repositories/responseRepository';
import ProviderFactory from '../adapters/providerFactory';
import HeuristicProvider from '../adapters/heuristicProvider';
import ContextBuilder from '../pipeline/contextBuilder';
import { NotFoundError } from '../../errors';

export class AiChatService {
  /**
   * Conducts interactive conversation about a collector's dataset.
   */
  public async askQuestion(
    surveyId: string,
    question: string,
    history: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = []
  ): Promise<{ answer: string; modelName: string; provider: string }> {
    if (!Types.ObjectId.isValid(surveyId)) {
      throw new NotFoundError('Data collector not found');
    }

    const survey = await surveyRepository.findById(surveyId);
    if (!survey || !survey.isActive) {
      throw new NotFoundError('Data collector not found or inactive');
    }

    const [results, rawResponses] = await Promise.all([
      responseRepository.calculateSurveyResults(surveyId, survey.questions),
      responseRepository.findAllBySurveyIdRaw(surveyId)
    ]);

    const context = ContextBuilder.buildContext(survey, results, rawResponses, 40);
    const provider = ProviderFactory.getProvider();

    try {
      const answer = await provider.chatWithData(context, question, history);
      return {
        answer,
        modelName: (provider as any).model || provider.name,
        provider: provider.name
      };
    } catch (err: any) {
      console.warn(`[AI Chat] ${provider.name} failed (${err?.message}). Engaging local intelligence engine...`);
      const fallback = new HeuristicProvider();
      const fallbackAnswer = await fallback.chatWithData(context, question, history);
      return {
        answer: `${fallbackAnswer}\n\n*(Note: Live AI service experienced high demand; answered via collector statistical engine)*`,
        modelName: 'local-statistical-engine',
        provider: 'heuristic'
      };
    }
  }
}

export const aiChatService = new AiChatService();
export default aiChatService;
