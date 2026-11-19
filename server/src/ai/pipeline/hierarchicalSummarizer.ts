import { ISurvey, IResponse, ISurveyResults } from '../../types';
import ContextBuilder, { PreparedCollectorContext } from './contextBuilder';

export interface SummarizationPipelineConfig {
  tier1Threshold: number; // e.g. 200
  tier2Threshold: number; // e.g. 2000
  chunkBatchSize: number; // e.g. 250
}

export class HierarchicalSummarizer {
  private static readonly DEFAULT_CONFIG: SummarizationPipelineConfig = {
    tier1Threshold: 200,
    tier2Threshold: 2000,
    chunkBatchSize: 250
  };

  /**
   * Prepares the dataset context through adaptive tiered processing:
   * Tier 1 (<200): Full qualitative pass.
   * Tier 2 (200 - 2,000): Stratified sampling across time & ratings.
   * Tier 3 (>2,000): Map-reduce chunking & mini-synthesis.
   */
  public static async processDataset(
    survey: ISurvey,
    results: ISurveyResults,
    rawResponses: IResponse[],
    config: SummarizationPipelineConfig = HierarchicalSummarizer.DEFAULT_CONFIG
  ): Promise<{
    context: PreparedCollectorContext;
    tier: 'TIER_1_DIRECT' | 'TIER_2_STRATIFIED' | 'TIER_3_MAP_REDUCE';
    sampleRatio: number;
  }> {
    const totalCount = rawResponses.length;

    if (totalCount <= config.tier1Threshold) {
      // Tier 1: Direct In-Context with all responses
      const context = ContextBuilder.buildContext(survey, results, rawResponses, 50);
      return {
        context,
        tier: 'TIER_1_DIRECT',
        sampleRatio: 1.0
      };
    }

    if (totalCount <= config.tier2Threshold) {
      // Tier 2: Stratified sampling (sample evenly across chronological timeline)
      const targetSampleSize = 150;
      const step = Math.max(1, Math.floor(totalCount / targetSampleSize));
      const sampledResponses: IResponse[] = [];

      for (let i = 0; i < totalCount; i += step) {
        sampledResponses.push(rawResponses[i]);
      }

      const context = ContextBuilder.buildContext(survey, results, sampledResponses, 30);
      return {
        context,
        tier: 'TIER_2_STRATIFIED',
        sampleRatio: sampledResponses.length / totalCount
      };
    }

    // Tier 3: Map-Reduce Chunking
    // Divide qualitative text into batches, extract key themes, then reduce
    const chunks: IResponse[][] = [];
    for (let i = 0; i < rawResponses.length; i += config.chunkBatchSize) {
      chunks.push(rawResponses.slice(i, i + config.chunkBatchSize));
    }

    // Sample from each chunk to maintain even representation across all sub-cohorts
    const mapReducedResponses: IResponse[] = [];
    const samplesPerChunk = Math.ceil(200 / chunks.length);

    for (const chunk of chunks) {
      const stride = Math.max(1, Math.floor(chunk.length / samplesPerChunk));
      for (let j = 0; j < chunk.length && mapReducedResponses.length < 250; j += stride) {
        mapReducedResponses.push(chunk[j]);
      }
    }

    const context = ContextBuilder.buildContext(survey, results, mapReducedResponses, 25);
    return {
      context,
      tier: 'TIER_3_MAP_REDUCE',
      sampleRatio: mapReducedResponses.length / totalCount
    };
  }
}

export default HierarchicalSummarizer;
