const Response = require('../models/Response');
const Survey = require('../models/Survey');

// Submit a new response
exports.submitResponse = async (req, res) => {
  try {
    const { surveyId, answers } = req.body;

    // Verify survey exists
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    // Create response
    const response = await Response.create({
      surveyId,
      answers
    });

    res.status(201).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get survey results
exports.getSurveyResults = async (req, res) => {
  try {
    const { surveyId } = req.params;

    // Get all responses for the survey
    const responses = await Response.find({ surveyId }).populate('surveyId');

    // Get the survey to access question types
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    // Process results based on question types
    const results = survey.questions.map(question => {
      const questionResponses = responses.flatMap(r => 
        r.answers.filter(a => a.questionId.toString() === question._id.toString())
      );

      let analysis = {
        questionId: question._id,
        questionText: question.questionText,
        type: question.type,
        totalResponses: questionResponses.length
      };

      switch (question.type) {
        case 'rating':
          const ratings = questionResponses.map(r => Number(r.answer));
          analysis.averageRating = ratings.reduce((a, b) => a + b, 0) / ratings.length || 0;
          break;

        case 'multiple-choice':
        case 'checkbox':
          const optionCounts = {};
          question.options.forEach(option => {
            optionCounts[option] = questionResponses.filter(r => 
              question.type === 'checkbox' 
                ? r.answer.includes(option)
                : r.answer === option
            ).length;
          });
          analysis.optionCounts = optionCounts;
          break;

        case 'text':
          analysis.responses = questionResponses.map(r => r.answer);
          break;
      }

      return analysis;
    });

    res.json({
      surveyId,
      totalResponses: responses.length,
      results
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all responses for a survey
exports.getAllResponses = async (req, res) => {
  try {
    const responses = await Response.find({ surveyId: req.params.surveyId })
      .populate('surveyId')
      .sort('-submittedAt');
    res.json(responses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};