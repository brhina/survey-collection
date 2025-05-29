const Survey = require('../models/Survey');

// Create a new survey
exports.createSurvey = async (req, res) => {
  try {
    const survey = await Survey.create(req.body);
    res.status(201).json(survey);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all surveys
exports.getAllSurveys = async (req, res) => {
  try {
    const surveys = await Survey.find({ isActive: true });
    res.json(surveys);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single survey by ID
exports.getSurveyById = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }
    res.json(survey);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a survey
exports.updateSurvey = async (req, res) => {
  try {
    const survey = await Survey.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }
    res.json(survey);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a survey (soft delete)
exports.deleteSurvey = async (req, res) => {
  try {
    const survey = await Survey.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }
    res.json({ message: 'Survey deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};