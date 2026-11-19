import { IAiRiskFactor } from '../schemas/aiAnalysisSchema';
import { PreparedCollectorContext } from '../pipeline/contextBuilder';

export class RiskEvaluator {
  /**
   * Evaluates risks based on category, negative sentiment density,
   * low ratings, and hazard keywords.
   */
  public static evaluateRisks(context: PreparedCollectorContext): IAiRiskFactor[] {
    const risks: IAiRiskFactor[] = [];
    const category = context.category;

    // 1. Inspect Quantitative Anomalies (Low ratings <= 2.5 / 5)
    for (const q of context.quantitativeSummary) {
      if (q.averageRating !== undefined && q.averageRating < 2.5) {
        risks.push({
          risk: `Critically low performance in "${q.questionText}" (Average score: ${q.averageRating.toFixed(2)}/5)`,
          severity: category === 'inspection' ? 'CRITICAL' : 'HIGH',
          likelihood: 'ALMOST_CERTAIN',
          mitigation: `Execute immediate remediation review and audit underlying protocols for "${q.questionText}".`
        });
      }

      // Check for high negative distribution on multiple choice
      if (q.optionDistribution) {
        for (const [opt, stats] of Object.entries(q.optionDistribution)) {
          const lowerOpt = opt.toLowerCase();
          if (
            (lowerOpt.includes('fail') || lowerOpt.includes('no') || lowerOpt.includes('hazard') || lowerOpt.includes('unsatisfied')) &&
            stats.percentage >= 25
          ) {
            risks.push({
              risk: `Significant negative response density (${stats.percentage}%) on option "${opt}" for "${q.questionText}"`,
              severity: stats.percentage > 50 ? 'HIGH' : 'MEDIUM',
              likelihood: 'LIKELY',
              mitigation: `Investigate root cause behind high selection rate of "${opt}".`
            });
          }
        }
      }
    }

    // 2. Scan Qualitative Comments for Critical Keywords
    const hazardKeywords = ['fire', 'leak', 'danger', 'hazard', 'injury', 'broken', 'emergency', 'blockage', 'toxic', 'violation'];
    const churnKeywords = ['cancel', 'refund', 'unacceptable', 'terrible', 'worst', 'scam', 'crash', 'freeze', 'bug'];

    const targetKeywords = category === 'inspection' ? hazardKeywords : churnKeywords;
    let keywordHits = 0;

    for (const q of context.qualitativeFeedback) {
      for (const comment of q.comments) {
        const lower = comment.toLowerCase();
        if (targetKeywords.some((kw) => lower.includes(kw))) {
          keywordHits++;
        }
      }
    }

    if (keywordHits > 0) {
      risks.push({
        risk: `Recurring critical keyword alerts (${keywordHits} occurrences in qualitative text)`,
        severity: category === 'inspection' ? 'CRITICAL' : 'HIGH',
        likelihood: keywordHits > 3 ? 'ALMOST_CERTAIN' : 'POSSIBLE',
        mitigation: `Dispatch dedicated personnel to inspect flagged qualitative incidents immediately.`
      });
    }

    // Fallback baseline risk if none detected
    if (risks.length === 0) {
      risks.push({
        risk: 'Potential response bias or unrepresentative sample size',
        severity: context.totalResponses < 20 ? 'MEDIUM' : 'LOW',
        likelihood: context.totalResponses < 20 ? 'LIKELY' : 'UNLIKELY',
        mitigation: 'Continue collecting responses to achieve higher statistical power and confidence.'
      });
    }

    return risks;
  }
}

export default RiskEvaluator;
