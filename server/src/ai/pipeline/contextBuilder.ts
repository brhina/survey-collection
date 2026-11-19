import { ISurvey, IResponse, ISurveyResults } from '../../types';
import PiiScrubber from './piiScrubber';

export interface PreparedCollectorContext {
  surveyId: string;
  title: string;
  description: string;
  category: string;
  totalResponses: number;
  completionRate?: string;
  quantitativeSummary: Array<{
    questionId: string;
    questionText: string;
    type: string;
    averageRating?: number;
    optionDistribution?: Record<string, { count: number; percentage: number }>;
    totalAnswers: number;
  }>;
  qualitativeFeedback: Array<{
    questionId: string;
    questionText: string;
    sampleCount: number;
    comments: string[];
  }>;
  formattedTextContext: string;
}

export class ContextBuilder {
  /**
   * Builds a structured, PII-scrubbed context representation combining
   * quantitative analytics and qualitative text responses.
   */
  public static buildContext(
    survey: ISurvey,
    results: ISurveyResults,
    rawResponses: IResponse[],
    maxTextSamplesPerQuestion: number = 30
  ): PreparedCollectorContext {
    const surveyId = (survey._id || '').toString();
    const totalResponses = results.totalResponses || rawResponses.length;

    // 1. Process Quantitative Metrics
    const quantitativeSummary = results.results.map((qResult) => {
      let optionDistribution: Record<string, { count: number; percentage: number }> | undefined;

      if (qResult.optionCounts) {
        optionDistribution = {};
        for (const [option, count] of Object.entries(qResult.optionCounts)) {
          const pct = qResult.totalResponses > 0
            ? Math.round((count / qResult.totalResponses) * 100)
            : 0;
          optionDistribution[option] = { count, percentage: pct };
        }
      }

      return {
        questionId: (qResult.questionId || '').toString(),
        questionText: qResult.questionText,
        type: qResult.type,
        averageRating: qResult.averageRating,
        optionDistribution,
        totalAnswers: qResult.totalResponses
      };
    });

    // 2. Extract and Scrub Qualitative Text Answers
    const qualitativeMap = new Map<string, { text: string; comments: string[] }>();

    for (const q of survey.questions) {
      if (['text', 'long-text', 'feedback'].includes(q.type) || !q.options || q.options.length === 0) {
        const qId = (q._id || '').toString();
        qualitativeMap.set(qId, {
          text: q.questionText,
          comments: []
        });
      }
    }

    for (const response of rawResponses) {
      for (const ans of response.answers) {
        const qId = (ans.questionId || '').toString();
        if (qualitativeMap.has(qId)) {
          const val = ans.answer;
          if (typeof val === 'string' && val.trim().length > 1) {
            const scrubbed = PiiScrubber.scrubText(val.trim());
            const entry = qualitativeMap.get(qId)!;
            if (entry.comments.length < maxTextSamplesPerQuestion) {
              entry.comments.push(scrubbed);
            }
          }
        }
      }
    }

    const qualitativeFeedback = Array.from(qualitativeMap.entries())
      .filter(([_, data]) => data.comments.length > 0)
      .map(([questionId, data]) => ({
        questionId,
        questionText: data.text,
        sampleCount: data.comments.length,
        comments: data.comments
      }));

    // 3. Assemble Human-Readable / LLM-Grounding Text Block
    let textSummary = `=== COLLECTOR DATASET REPORT ===\n`;
    textSummary += `Title: ${survey.title}\n`;
    textSummary += `Category: ${survey.category || 'general'}\n`;
    textSummary += `Total Submissions: ${totalResponses}\n`;
    textSummary += `Description: ${survey.description}\n\n`;

    textSummary += `--- QUANTITATIVE METRICS & DISTRIBUTIONS ---\n`;
    for (const q of quantitativeSummary) {
      textSummary += `[Question: "${q.questionText}" (${q.type})]\n`;
      textSummary += `  Responses: ${q.totalAnswers}\n`;
      if (q.averageRating !== undefined) {
        textSummary += `  Average Score/Rating: ${q.averageRating.toFixed(2)}\n`;
      }
      if (q.optionDistribution) {
        textSummary += `  Breakdown:\n`;
        for (const [opt, stats] of Object.entries(q.optionDistribution)) {
          textSummary += `    - "${opt}": ${stats.count} votes (${stats.percentage}%)\n`;
        }
      }
      textSummary += `\n`;
    }

    if (qualitativeFeedback.length > 0) {
      textSummary += `--- QUALITATIVE RESPONSES & USER FEEDBACK (PII SANITIZED) ---\n`;
      for (const q of qualitativeFeedback) {
        textSummary += `[Question: "${q.questionText}"] (${q.sampleCount} responses):\n`;
        q.comments.forEach((comment, idx) => {
          textSummary += `  ${idx + 1}. "${comment}"\n`;
        });
        textSummary += `\n`;
      }
    }

    return {
      surveyId,
      title: survey.title,
      description: survey.description,
      category: survey.category || 'general',
      totalResponses,
      quantitativeSummary,
      qualitativeFeedback,
      formattedTextContext: textSummary
    };
  }
}

export default ContextBuilder;
