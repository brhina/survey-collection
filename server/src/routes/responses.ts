import { Router } from 'express';
import {
  submitResponse,
  getSurveyResults,
  getAllResponses,
  checkEligibility
} from '../controllers/responseController';
import { validate } from '../middlewares/validate';
import { submitResponseSchema, checkEligibilityQuerySchema } from '../schemas/responseSchema';

const router = Router();

router.get('/check-eligibility', validate({ query: checkEligibilityQuerySchema }), checkEligibility);
router.post('/', validate({ body: submitResponseSchema }), submitResponse);
router.get('/survey/:surveyId/results', getSurveyResults);
router.get('/survey/:surveyId', getAllResponses);

export default router;
