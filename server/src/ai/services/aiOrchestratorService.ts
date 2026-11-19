import crypto from 'crypto';
import { Types } from 'mongoose';
import surveyRepository from '../../repositories/surveyRepository';
import responseRepository from '../../repositories/responseRepository';
import AiAnalysis, { IAiAnalysisDoc } from '../../models/AiAnalysis';
import ProviderFactory from '../adapters/providerFactory';
import HeuristicProvider from '../adapters/heuristicProvider';
import HierarchicalSummarizer from '../pipeline/hierarchicalSummarizer';
import { NotFoundError, BadRequestError } from '../../errors';
import { IAiCollectorAnalysis, DecisionOverrideInput } from '../schemas/aiAnalysisSchema';
import { INSPECTION_PROMPT_RUBRIC } from '../prompts/inspectionPrompt';
import { APPLICATION_PROMPT_RUBRIC } from '../prompts/applicationPrompt';
import { FEEDBACK_PROMPT_RUBRIC } from '../prompts/feedbackPrompt';
import { SURVEY_PROMPT_RUBRIC } from '../prompts/surveyPrompt';
import { env } from '../../config/env';

export interface AnalysisGenerationResult {
  analysis: IAiCollectorAnalysis;
  cached: boolean;
  modelName: string;
  provider: string;
  tokenUsage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  createdAt: Date;
  id?: string;
  humanOverride?: any;
}

export class AiOrchestratorService {
  /**
   * Generates a composite cache hash based on survey state and response count.
   */
  private generateCacheHash(surveyId: string, responseCount: number, lastSubmittedAt?: Date): string {
    const timeKey = lastSubmittedAt ? lastSubmittedAt.toISOString() : 'none';
    const raw = `${surveyId}::${responseCount}::${timeKey}::v1.0`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  /**
   * Retrieves category-specific rubric text.
   */
  private getRubricForCategory(category: string): string {
    switch (category.toLowerCase()) {
      case 'inspection':
        return INSPECTION_PROMPT_RUBRIC;
      case 'application':
        return APPLICATION_PROMPT_RUBRIC;
      case 'feedback':
        return FEEDBACK_PROMPT_RUBRIC;
      case 'survey':
      default:
        return SURVEY_PROMPT_RUBRIC;
    }
  }

  /**
   * Orchestrates the complete end-to-end AI analysis, caching, decision generation,
   * and persistence lifecycle.
   */
  public async generateCollectorAnalysis(
    surveyId: string,
    options?: {
      forceRefresh?: boolean;
      onStreamPhase?: (phase: string, message: string) => void;
    }
  ): Promise<AnalysisGenerationResult> {
    if (!Types.ObjectId.isValid(surveyId)) {
      throw new NotFoundError('Data collector not found');
    }

    const survey = await surveyRepository.findById(surveyId);
    if (!survey || !survey.isActive) {
      throw new NotFoundError('Data collector not found or inactive');
    }

    options?.onStreamPhase?.('INITIALIZING', `Loading data for collector "${survey.title}"...`);

    // Fetch aggregate statistics and raw submissions
    const [results, rawResponses] = await Promise.all([
      responseRepository.calculateSurveyResults(surveyId, survey.questions),
      responseRepository.findAllBySurveyIdRaw(surveyId)
    ]);

    const latestResponse = rawResponses[0];
    const cacheHash = this.generateCacheHash(
      surveyId,
      rawResponses.length,
      latestResponse?.submittedAt
    );

    // 1. Check Cache
    if (!options?.forceRefresh) {
      const ttlMs = (env.AI_CACHE_TTL_HOURS || 24) * 60 * 60 * 1000;
      const cached = await AiAnalysis.findOne({
        surveyId: new Types.ObjectId(surveyId),
        cacheHash,
        createdAt: { $gte: new Date(Date.now() - ttlMs) }
      }).sort({ createdAt: -1 });

      if (cached) {
        options?.onStreamPhase?.('CACHED', 'Loaded fresh analysis from intelligent cache');
        return {
          id: (cached._id as any).toString(),
          analysis: cached.analysis,
          cached: true,
          modelName: cached.modelName,
          provider: cached.provider,
          tokenUsage: cached.tokenUsage,
          createdAt: cached.createdAt,
          humanOverride: cached.humanOverride
        };
      }
    }

    // 2. Adaptive Hierarchical Pipeline (Tier 1, 2, or 3)
    options?.onStreamPhase?.('PROCESSING_PIPELINE', 'Running PII redaction and adaptive context scaling...');
    const { context, tier } = await HierarchicalSummarizer.processDataset(
      survey,
      results,
      rawResponses
    );

    options?.onStreamPhase?.(
      'CONTEXT_READY',
      `Dataset contextualized (${tier}, ${context.totalResponses} submissions evaluated)`
    );

    // 3. Provider Resolution & Execution
    let provider = ProviderFactory.getProvider();
    const categoryRubric = this.getRubricForCategory(survey.category || 'general');

    options?.onStreamPhase?.('INVOKING_MODEL', `Synthesizing decision via [${provider.name}] engine...`);

    let analysis: IAiCollectorAnalysis;
    let tokenUsage: { promptTokens: number; completionTokens: number; totalTokens: number };

    try {
      const generated = await provider.generateAnalysis(context, {
        categoryRubric,
        onStreamPhase: options?.onStreamPhase
      });
      analysis = generated.analysis;
      tokenUsage = generated.tokenUsage;
    } catch (err: any) {
      console.warn(`[AI Orchestrator] ${provider.name} failed (${err?.message}). Engaging local intelligence fallback...`);
      const fallback = new HeuristicProvider();
      const generated = await fallback.generateAnalysis(context, {
        categoryRubric,
        onStreamPhase: options?.onStreamPhase
      });
      analysis = generated.analysis;
      tokenUsage = generated.tokenUsage;
      provider = fallback;
    }

    // 4. Persistence into Audit Ledger
    options?.onStreamPhase?.('PERSISTING', 'Saving decision record into compliance ledger...');
    const savedRecord = await AiAnalysis.create({
      surveyId: new Types.ObjectId(surveyId),
      collectorCategory: survey.category || 'general',
      responseCountAtAnalysis: rawResponses.length,
      cacheHash,
      analysis,
      tokenUsage,
      modelName: (provider as any).model || provider.name,
      provider: provider.name
    });

    return {
      id: (savedRecord._id as any).toString(),
      analysis,
      cached: false,
      modelName: (provider as any).model || provider.name,
      provider: provider.name,
      tokenUsage,
      createdAt: savedRecord.createdAt
    };
  }

  /**
   * Retrieves the most recent AI analysis record for a collector.
   */
  public async getLatestAnalysis(surveyId: string): Promise<AnalysisGenerationResult | null> {
    if (!Types.ObjectId.isValid(surveyId)) {
      throw new NotFoundError('Data collector not found');
    }

    const record = await AiAnalysis.findOne({ surveyId: new Types.ObjectId(surveyId) })
      .sort({ createdAt: -1 })
      .lean();

    if (!record) {
      return null;
    }

    return {
      id: record._id.toString(),
      analysis: record.analysis,
      cached: true,
      modelName: record.modelName,
      provider: record.provider,
      tokenUsage: record.tokenUsage,
      createdAt: record.createdAt,
      humanOverride: record.humanOverride
    };
  }

  /**
   * Records a formal Human-in-the-Loop decision override for compliance and audit governance.
   */
  public async recordDecisionOverride(
    surveyId: string,
    overrideInput: DecisionOverrideInput,
    userId: string
  ): Promise<IAiAnalysisDoc> {
    if (!Types.ObjectId.isValid(surveyId)) {
      throw new NotFoundError('Data collector not found');
    }

    const latest = await AiAnalysis.findOne({ surveyId: new Types.ObjectId(surveyId) })
      .sort({ createdAt: -1 });

    if (!latest) {
      throw new BadRequestError('No existing AI analysis found to override. Please generate an analysis first.');
    }

    const originalDecision = latest.analysis.verdict.decision;

    latest.humanOverride = {
      overriddenBy: new Types.ObjectId(userId),
      originalDecision,
      newDecision: overrideInput.newDecision,
      overrideReason: overrideInput.overrideReason,
      overriddenAt: new Date()
    };

    // Update the active verdict inside the analysis payload
    latest.analysis.verdict.decision = overrideInput.newDecision;
    latest.analysis.verdict.statusBadge = overrideInput.statusBadge;
    latest.markModified('analysis');
    latest.markModified('humanOverride');

    await latest.save();
    return latest;
  }
}

export const aiOrchestratorService = new AiOrchestratorService();
export default aiOrchestratorService;
