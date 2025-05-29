const express = require('express');
const router = express.Router();
const {
  createSurvey,
  getAllSurveys,
  getSurveyById,
  updateSurvey,
  deleteSurvey
} = require('../controllers/surveyController');

// Survey routes
router.post('/', createSurvey);
router.get('/', getAllSurveys);
router.get('/:id', getSurveyById);
router.put('/:id', updateSurvey);
router.delete('/:id', deleteSurvey);

module.exports = router;