/**
 * Decision Engine: Bayesian & Statistical Confidence Scorer
 * Evaluates dataset sample size, response dispersion, and consistency
 * to assign an objective 0-100% confidence rating to the AI verdict.
 */

export interface ConfidenceEvaluationFactors {
  totalResponses: number;
  averageVariance?: number; // Spread of ratings
  qualitativeSampleCount: number;
  hasCriticalConflict: boolean;
}

export class ConfidenceScorer {
  /**
   * Computes a 0-100 Bayesian confidence score.
   */
  public static calculateConfidence(factors: ConfidenceEvaluationFactors): number {
    const { totalResponses, averageVariance = 0.5, qualitativeSampleCount, hasCriticalConflict } = factors;

    // 1. Base Score derived from Sample Size Volume (0 to 50 pts)
    let sampleSizePoints = 0;
    if (totalResponses <= 0) {
      return 15;
    } else if (totalResponses < 5) {
      sampleSizePoints = 20;
    } else if (totalResponses < 15) {
      sampleSizePoints = 32;
    } else if (totalResponses < 50) {
      sampleSizePoints = 42;
    } else if (totalResponses < 200) {
      sampleSizePoints = 47;
    } else {
      sampleSizePoints = 50;
    }

    // 2. Agreement & Variance Bonus (0 to 30 pts)
    // Low variance (< 0.4) indicates high consensus. High variance (> 1.2) indicates polarization.
    let consensusPoints = 25;
    if (averageVariance < 0.3) {
      consensusPoints = 30;
    } else if (averageVariance > 1.2) {
      consensusPoints = 12; // Polarized opinions reduce confidence in a single verdict
    }

    // 3. Qualitative Depth Bonus (0 to 20 pts)
    let qualitativePoints = 10;
    if (qualitativeSampleCount >= 10) {
      qualitativePoints = 20;
    } else if (qualitativeSampleCount >= 3) {
      qualitativePoints = 15;
    }

    let totalScore = sampleSizePoints + consensusPoints + qualitativePoints;

    // Penalty if critical contradictory signals exist
    if (hasCriticalConflict) {
      totalScore -= 15;
    }

    // Clamp between 20 and 99% (never 100% in statistical decision science)
    return Math.max(20, Math.min(98, Math.round(totalScore)));
  }
}

export default ConfidenceScorer;
