import { Router } from 'express';
import {
  submitResponse,
  getSurveyResults,
  getAllResponses
} from '../controllers/responseController';

const router = Router();

router.post('/', submitResponse);
router.get('/survey/:surveyId/results', getSurveyResults);
router.get('/survey/:surveyId', getAllResponses);

export default router;
