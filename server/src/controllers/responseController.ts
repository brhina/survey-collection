import { Request, Response as ExpressResponse } from 'express';
import Response from '../models/Response';
import Survey from '../models/Survey';
import { IQuestionAnalysis } from '../types';

// Submit a new response
export const submitResponse = async (req: Request, res: ExpressResponse): Promise<void> => {
  try {
    const { surveyId, answers } = req.body;

    // Verify survey exists
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      res.status(404).json({ message: 'Survey not found' });
      return;
    }

    // Create response
    const response = await Response.create({
      surveyId,
      answers
    });

    res.status(201).json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to submit response';
    res.status(400).json({ message });
  }
};

// Get survey results
export const getSurveyResults = async (req: Request, res: ExpressResponse): Promise<void> => {
  try {
    const { surveyId } = req.params;

    // Get all responses for the survey
    const responses = await Response.find({ surveyId }).populate('surveyId');

    // Get the survey to access question types
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      res.status(404).json({ message: 'Survey not found' });
      return;
    }

    // Process results based on question types
    const results: IQuestionAnalysis[] = survey.questions.map(question => {
      const qIdStr = question._id ? question._id.toString() : '';
      const questionResponses = responses.flatMap(r =>
        r.answers.filter(a => a.questionId.toString() === qIdStr)
      );

      const analysis: IQuestionAnalysis = {
        questionId: question._id || '',
        questionText: question.questionText,
        type: question.type,
        totalResponses: questionResponses.length
      };

      switch (question.type) {
        case 'rating': {
          const ratings = questionResponses.map(r => Number(r.answer));
          analysis.averageRating = ratings.length > 0
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
            : 0;
          break;
        }

        case 'multiple-choice':
        case 'checkbox': {
          const optionCounts: Record<string, number> = {};
          (question.options || []).forEach(option => {
            optionCounts[option] = questionResponses.filter(r =>
              question.type === 'checkbox'
                ? Array.isArray(r.answer) && r.answer.includes(option)
                : r.answer === option
            ).length;
          });
          analysis.optionCounts = optionCounts;
          break;
        }

        case 'text': {
          analysis.responses = questionResponses.map(r => r.answer);
          break;
        }
      }

      return analysis;
    });

    res.json({
      surveyId,
      totalResponses: responses.length,
      results
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to calculate results';
    res.status(500).json({ message });
  }
};

// Get all responses for a survey
export const getAllResponses = async (req: Request, res: ExpressResponse): Promise<void> => {
  try {
    const responses = await Response.find({ surveyId: req.params.surveyId })
      .populate('surveyId')
      .sort('-submittedAt');
    res.json(responses);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch responses';
    res.status(500).json({ message });
  }
};
