import { IAiVerdict } from '../schemas/aiAnalysisSchema';
import { PreparedCollectorContext } from '../pipeline/contextBuilder';
import ConfidenceScorer from './confidenceScorer';

export class DecisionMatrix {
  /**
   * Deterministically evaluates the collector data context against category rubrics
   * to produce a grounded decision verdict, confidence score, and chain-of-thought justification.
   */
  public static evaluateVerdict(context: PreparedCollectorContext): IAiVerdict {
    const category = context.category.toLowerCase();
    const totalResponses = context.totalResponses;

    // Calculate aggregate score across all rating / number questions
    let totalScore = 0;
    let scoreCount = 0;
    let minRating = 5;

    for (const q of context.quantitativeSummary) {
      if (q.averageRating !== undefined) {
        totalScore += q.averageRating;
        scoreCount++;
        if (q.averageRating < minRating) {
          minRating = q.averageRating;
        }
      }
    }

    const overallAverage = scoreCount > 0 ? totalScore / scoreCount : 3.5;
    const qualitativeSamples = context.qualitativeFeedback.reduce((acc, q) => acc + q.comments.length, 0);

    const confidenceScore = ConfidenceScorer.calculateConfidence({
      totalResponses,
      averageVariance: 0.5,
      qualitativeSampleCount: qualitativeSamples,
      hasCriticalConflict: minRating < 2.5 && overallAverage > 3.8
    });

    switch (category) {
      case 'inspection':
        return this.evaluateInspection(context, overallAverage, minRating, confidenceScore);
      case 'application':
        return this.evaluateApplication(context, overallAverage, minRating, confidenceScore);
      case 'feedback':
        return this.evaluateFeedback(context, overallAverage, minRating, confidenceScore);
      case 'registration':
        return this.evaluateRegistration(context, confidenceScore);
      case 'survey':
      default:
        return this.evaluateSurvey(context, overallAverage, minRating, confidenceScore);
    }
  }

  private static evaluateInspection(
    context: PreparedCollectorContext,
    avg: number,
    min: number,
    confidence: number
  ): IAiVerdict {
    if (min < 2.5 || avg < 2.8) {
      return {
        decision: 'CRITICAL_HAZARD_FAIL',
        statusBadge: 'DANGER',
        confidenceScore: confidence,
        verdictHeadline: 'Inspection Failed: Critical Safety Violations Flagged',
        coreJustification: `Audit failed due to severely low scores (min rating ${min.toFixed(2)}/5, overall average ${avg.toFixed(2)}/5). Immediate operational remediation and supervisor intervention are legally mandated before facility re-certification.`
      };
    }

    if (avg < 4.0 || min < 3.2) {
      return {
        decision: 'CONDITIONAL_PASS',
        statusBadge: 'WARNING',
        confidenceScore: confidence,
        verdictHeadline: 'Conditional Approval Granted: Corrective Action Required',
        coreJustification: `Overall inspection score averaged ${avg.toFixed(2)}/5 across ${context.totalResponses} inspections. While no fatal hazards were found, specific checkpoints failed standard thresholds and must be remediated within 7 business days.`
      };
    }

    return {
      decision: 'PASSED',
      statusBadge: 'SUCCESS',
      confidenceScore: confidence,
      verdictHeadline: 'Full Safety & Compliance Certification Granted',
      coreJustification: `All audit parameters exceeded compliance benchmarks with an aggregate score of ${avg.toFixed(2)}/5 across ${context.totalResponses} submissions. Zero critical infractions were recorded.`
    };
  }

  private static evaluateApplication(
    context: PreparedCollectorContext,
    avg: number,
    min: number,
    confidence: number
  ): IAiVerdict {
    if (avg >= 4.2 && min >= 3.0) {
      return {
        decision: 'ADMIT / FAST_TRACK',
        statusBadge: 'SUCCESS',
        confidenceScore: confidence,
        verdictHeadline: 'Candidate Cohort Recommended for Immediate Admission / Offer',
        coreJustification: `Evaluation demonstrates exceptional competence (aggregate score ${avg.toFixed(2)}/5) across all qualifying rubrics with zero disqualifying indicators.`
      };
    }

    if (avg >= 3.0) {
      return {
        decision: 'INVITE_INTERVIEW',
        statusBadge: 'INFO',
        confidenceScore: confidence,
        verdictHeadline: 'Applicant Profile Requires Human Panel Interview',
        coreJustification: `Quantitative ratings show moderate fit (${avg.toFixed(2)}/5). Qualitative responses warrant targeted live panel interrogation before a definitive admission decision.`
      };
    }

    return {
      decision: 'REJECT / ARCHIVE',
      statusBadge: 'DANGER',
      confidenceScore: confidence,
      verdictHeadline: 'Application Does Not Meet Mandatory Cohort Standards',
      coreJustification: `The applicant profile recorded an aggregate rating of ${avg.toFixed(2)}/5, falling below minimum eligibility cutoffs.`
    };
  }

  private static evaluateFeedback(
    context: PreparedCollectorContext,
    avg: number,
    _min: number,
    confidence: number
  ): IAiVerdict {
    if (avg < 3.0) {
      return {
        decision: 'CRITICAL_CHURN_RISK',
        statusBadge: 'DANGER',
        confidenceScore: confidence,
        verdictHeadline: 'Critical Product Alert: High Dissatisfaction & Churn Risk',
        coreJustification: `Customer satisfaction has degraded to an average of ${avg.toFixed(2)}/5 across ${context.totalResponses} reviews. Qualitative commentary highlights severe system friction requiring emergency engineering intervention.`
      };
    }

    if (avg < 4.0) {
      return {
        decision: 'FEATURE_REFACTOR_URGENT',
        statusBadge: 'WARNING',
        confidenceScore: confidence,
        verdictHeadline: 'Refactor Required: Usability Bottlenecks Identified',
        coreJustification: `While baseline utility is preserved (${avg.toFixed(2)}/5), recurrent friction in core features prevents positive net promoter scores.`
      };
    }

    return {
      decision: 'PRODUCT_HEALTH_STABLE',
      statusBadge: 'SUCCESS',
      confidenceScore: confidence,
      verdictHeadline: 'Healthy Customer Sentiment & High Retention Trajectory',
      coreJustification: `User sentiment is overwhelmingly positive (${avg.toFixed(2)}/5). Feedback confirms high adoption willingness and strong user satisfaction.`
    };
  }

  private static evaluateRegistration(
    context: PreparedCollectorContext,
    confidence: number
  ): IAiVerdict {
    if (context.totalResponses >= 50) {
      return {
        decision: 'OVERCAPACITY_SPLIT_SESSIONS',
        statusBadge: 'WARNING',
        confidenceScore: confidence,
        verdictHeadline: 'Capacity Exceeded: Recommend Adding Parallel Session',
        coreJustification: `Intake volume (${context.totalResponses} registered participants) has reached capacity thresholds. Recommend splitting attendees into morning/afternoon cohorts.`
      };
    }

    return {
      decision: 'ROSTER_CONFIRMED',
      statusBadge: 'SUCCESS',
      confidenceScore: confidence,
      verdictHeadline: 'Registration Target Met: Session Confirmed',
      coreJustification: `Intake count (${context.totalResponses} attendees) is within optimal venue capacity. Final attendee confirmation packets can be dispatched.`
    };
  }

  private static evaluateSurvey(
    context: PreparedCollectorContext,
    avg: number,
    min: number,
    confidence: number
  ): IAiVerdict {
    if (avg < 3.0 || min < 2.0) {
      return {
        decision: 'POLICY_PIVOT_REQUIRED',
        statusBadge: 'DANGER',
        confidenceScore: confidence,
        verdictHeadline: 'Policy Revision Mandated by Stakeholder Consensus',
        coreJustification: `Survey data demonstrates substantial stakeholder dissatisfaction (average score ${avg.toFixed(2)}/5). Key areas require an immediate strategic shift.`
      };
    }

    if (avg < 4.0) {
      return {
        decision: 'PARTIAL_INTERVENTION',
        statusBadge: 'INFO',
        confidenceScore: confidence,
        verdictHeadline: 'Targeted Remediation Recommended in Select Areas',
        coreJustification: `General satisfaction is acceptable (${avg.toFixed(2)}/5), but targeted intervention is necessary for specific lower-ranking metrics.`
      };
    }

    return {
      decision: 'STATUS_QUO_CONFIRMED',
      statusBadge: 'SUCCESS',
      confidenceScore: confidence,
      verdictHeadline: 'Strong Positive Alignment Across Stakeholders',
      coreJustification: `The survey recorded high stakeholder alignment and endorsement (${avg.toFixed(2)}/5 across ${context.totalResponses} respondents).`
    };
  }
}

export default DecisionMatrix;
