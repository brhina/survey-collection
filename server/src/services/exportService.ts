import surveyRepository from '../repositories/surveyRepository';
import responseRepository from '../repositories/responseRepository';
import { NotFoundError } from '../errors';

export class ExportService {
  async exportToCSV(surveyId: string): Promise<{ filename: string; csv: string }> {
    const survey = await surveyRepository.findById(surveyId);
    if (!survey) {
      throw new NotFoundError('Survey not found');
    }

    const responses = await responseRepository.findAllBySurveyIdRaw(surveyId);

    // Build CSV Headers
    const headers = ['Response ID', 'Respondent Email', 'Submitted At', 'Completion Time (seconds)'];
    survey.questions.forEach((q, idx) => {
      const sanitizedTitle = q.questionText.replace(/"/g, '""');
      headers.push(`"Q${idx + 1}: ${sanitizedTitle}"`);
    });

    const rows: string[] = [headers.join(',')];

    // Build data rows
    responses.forEach((resp) => {
      const respId = resp._id ? resp._id.toString() : '';
      const email = (resp.respondentEmail || 'Anonymous').replace(/"/g, '""');
      const submittedAt = resp.submittedAt ? new Date(resp.submittedAt).toISOString() : '';
      const completionTime = resp.completionTimeSeconds || 0;

      const answerMap = new Map<string, unknown>();
      resp.answers.forEach((ans) => {
        answerMap.set(ans.questionId.toString(), ans.answer);
      });

      const rowValues: string[] = [respId, `"${email}"`, submittedAt, completionTime.toString()];

      survey.questions.forEach((q) => {
        const qIdStr = q._id ? q._id.toString() : '';
        const val = answerMap.get(qIdStr);

        let cellValue = '';
        if (Array.isArray(val)) {
          cellValue = val.join('; ');
        } else if (val !== undefined && val !== null) {
          cellValue = String(val);
        }

        // CSV escaping: double quotes escape quotes, and wrap cell in quotes
        const escaped = `"${cellValue.replace(/"/g, '""')}"`;
        rowValues.push(escaped);
      });

      rows.push(rowValues.join(','));
    });

    const cleanTitle = survey.title.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const filename = `survey_${cleanTitle}_responses.csv`;

    return {
      filename,
      csv: rows.join('\n')
    };
  }

  async exportToJSON(surveyId: string): Promise<{ filename: string; data: unknown }> {
    const survey = await surveyRepository.findById(surveyId);
    if (!survey) {
      throw new NotFoundError('Survey not found');
    }

    const responses = await responseRepository.findAllBySurveyIdRaw(surveyId);

    const cleanTitle = survey.title.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const filename = `survey_${cleanTitle}_responses.json`;

    return {
      filename,
      data: {
        survey: {
          id: survey._id,
          title: survey.title,
          description: survey.description,
          totalQuestions: survey.questions.length
        },
        totalResponses: responses.length,
        responses
      }
    };
  }
}

export const exportService = new ExportService();
export default exportService;
