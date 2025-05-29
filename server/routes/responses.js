const express = require('express');
const router = express.Router();
const {
  submitResponse,
  getSurveyResults,
  getAllResponses
} = require('../controllers/responseController');

// Response routes
router.post('/', submitResponse);
router.get('/survey/:surveyId/results', getSurveyResults);
router.get('/survey/:surveyId', getAllResponses);

module.exports = router;