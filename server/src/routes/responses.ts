import { Router } from 'express';
import {
  submitResponse,
  getSurveyResults,
  getAllResponses
} from '../controllers/responseController';
import { validate } from '../middlewares/validate';
import { submitResponseSchema } from '../schemas/responseSchema';

const router = Router();

router.post('/', validate({ body: submitResponseSchema }), submitResponse);
router.get('/survey/:surveyId/results', getSurveyResults);
router.get('/survey/:surveyId', getAllResponses);

export default router;
