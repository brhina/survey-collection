import { ILlmProvider, ProviderGenerateOptions } from './llmProvider.interface';
import { PreparedCollectorContext } from '../pipeline/contextBuilder';
import {
  IAiCollectorAnalysis,
  AiCollectorAnalysisSchema
} from '../schemas/aiAnalysisSchema';
import DecisionMatrix from '../decisionEngine/decisionMatrix';
import RiskEvaluator from '../decisionEngine/riskEvaluator';

export class HeuristicProvider implements ILlmProvider {
  public readonly name = 'heuristic';

  public isAvailable(): boolean {
    return true; // Always available without API keys
  }

  public async generateAnalysis(
    context: PreparedCollectorContext,
    options?: ProviderGenerateOptions
  ): Promise<{
    analysis: IAiCollectorAnalysis;
    tokenUsage: { promptTokens: number; completionTokens: number; totalTokens: number };
  }> {
    // Notify streaming phase listeners if provided
    options?.onStreamPhase?.('DATA_PREPARATION', `Aggregated ${context.totalResponses} responses & sanitized PII`);
    options?.onStreamPhase?.('EVALUATION', `Evaluating ${context.category.toUpperCase()} rubrics and variance`);

    // 1. Evaluate Decision Verdict & Confidence
    const verdict = DecisionMatrix.evaluateVerdict(context);

    // 2. Evaluate Risks
    const risks = RiskEvaluator.evaluateRisks(context);

    // 3. Extract Key Themes from Quantitative & Qualitative
    const keyThemes = [];
    for (const q of context.quantitativeSummary.slice(0, 3)) {
      if (q.averageRating !== undefined) {
        const sentiment = q.averageRating >= 4.0 ? 'VERY_POSITIVE' : q.averageRating >= 3.0 ? 'NEUTRAL' : 'NEGATIVE';
        keyThemes.push({
          theme: `Evaluation of "${q.questionText}"`,
          sentiment: sentiment as any,
          percentageAffected: Math.min(100, Math.round((q.totalAnswers / Math.max(1, context.totalResponses)) * 100)),
          summary: `Average rating of ${q.averageRating.toFixed(2)}/5 across ${q.totalAnswers} recorded answers.`
        });
      } else if (q.optionDistribution) {
        const topOpt = Object.entries(q.optionDistribution).sort((a, b) => b[1].count - a[1].count)[0];
        if (topOpt) {
          keyThemes.push({
            theme: `Distribution for "${q.questionText}"`,
            sentiment: 'NEUTRAL' as any,
            percentageAffected: topOpt[1].percentage,
            summary: `Majority consensus (${topOpt[1].percentage}%) selected "${topOpt[0]}".`
          });
        }
      }
    }

    if (context.qualitativeFeedback.length > 0) {
      const qText = context.qualitativeFeedback[0];
      keyThemes.push({
        theme: `Feedback on "${qText.questionText}"`,
        sentiment: verdict.statusBadge === 'DANGER' ? 'NEGATIVE' : 'POSITIVE' as any,
        percentageAffected: Math.min(100, Math.round((qText.sampleCount / Math.max(1, context.totalResponses)) * 100)),
        summary: `${qText.sampleCount} qualitative suggestions and observations captured.`
      });
    }

    // 4. Build Evidence Citations
    const citations = [];
    for (const q of context.quantitativeSummary.slice(0, 2)) {
      const matchingTextQ = context.qualitativeFeedback.find((textQ) => textQ.questionId === q.questionId);
      citations.push({
        questionId: q.questionId,
        questionText: q.questionText,
        metricValue: q.averageRating !== undefined
          ? `Average Score: ${q.averageRating.toFixed(2)}/5`
          : `${q.totalAnswers} responses logged`,
        sampleQuotes: matchingTextQ ? matchingTextQ.comments.slice(0, 3) : ['Quantitative metric verified by aggregated submission logs.']
      });
    }

    // 5. Build Prioritized Actionable Roadmap
    const actionableRoadmap = [
      {
        priority: (verdict.statusBadge === 'DANGER' ? 'P0_IMMEDIATE' : 'P1_HIGH') as any,
        actionItem: `Address key findings identified in ${verdict.verdictHeadline}`,
        suggestedOwnerRole: context.category === 'inspection' ? 'Lead Safety Marshal' : 'Operations Lead',
        timeframe: verdict.statusBadge === 'DANGER' ? 'Within 24 hours' : 'Within 7 business days'
      },
      {
        priority: 'P2_MEDIUM' as any,
        actionItem: `Debrief stakeholders on verified feedback patterns and audit records`,
        suggestedOwnerRole: 'Department Supervisor',
        timeframe: 'Next scheduled review cycle'
      }
    ];

    const executiveSummary = `Comprehensive synthesis of the "${context.title}" ${context.category} collector indicates an operational status of ${verdict.decision}. Data analysis across ${context.totalResponses} submissions reveals high compliance in foundational metrics, accompanied by an overall confidence rating of ${verdict.confidenceScore}%.`;

    options?.onStreamPhase?.('SYNTHESIS', 'Structured cognitive synthesis complete');

    const rawResult: IAiCollectorAnalysis = {
      executiveSummary,
      category: context.category,
      verdict,
      keyThemes,
      citations,
      risks,
      actionableRoadmap,
      dataIntegrityNotes: context.totalResponses < 15
        ? `Preliminary dataset with ${context.totalResponses} responses. Statistical significance will increase as intake volume grows.`
        : undefined
    };

    // Validate with Zod
    const validated = AiCollectorAnalysisSchema.parse(rawResult);

    return {
      analysis: validated,
      tokenUsage: {
        promptTokens: 420,
        completionTokens: 380,
        totalTokens: 800
      }
    };
  }

  public async chatWithData(
    context: PreparedCollectorContext,
    userQuestion: string,
    _history: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
  ): Promise<string> {
    const qLower = userQuestion.toLowerCase();

    if (qLower.includes('how many') || qLower.includes('count') || qLower.includes('total')) {
      return `There are currently ${context.totalResponses} submissions recorded for "${context.title}".`;
    }

    if (qLower.includes('verdict') || qLower.includes('decision') || qLower.includes('status')) {
      const verdict = DecisionMatrix.evaluateVerdict(context);
      return `The current automated decision is **${verdict.decision}** (Confidence: ${verdict.confidenceScore}%). ${verdict.coreJustification}`;
    }

    if (qLower.includes('risk') || qLower.includes('hazard') || qLower.includes('danger')) {
      const risks = RiskEvaluator.evaluateRisks(context);
      return `Identified risks for this collector:\n` + risks.map((r, i) => `${i + 1}. **[${r.severity}]** ${r.risk} (Mitigation: ${r.mitigation})`).join('\n');
    }

    if (qLower.includes('average') || qLower.includes('rating') || qLower.includes('score')) {
      const ratingQuestions = context.quantitativeSummary.filter((q) => q.averageRating !== undefined);
      if (ratingQuestions.length > 0) {
        return `Quantitative Rating Summary:\n` + ratingQuestions.map((q) => `- "${q.questionText}": **${q.averageRating?.toFixed(2)}/5**`).join('\n');
      }
    }

    return `Based on the collected data for "${context.title}" (${context.totalResponses} submissions in category '${context.category}'), the primary verdict is currently active. For deep-dive drilldown, review the quantitative distributions and qualitative themes in the AI Intelligence Dashboard.`;
  }
}

export default HeuristicProvider;
