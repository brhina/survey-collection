import { Router } from 'express';
import {
  submitResponse,
  getSurveyResults,
  getAllResponses
} from '../../controllers/responseController';
import { validate } from '../../middlewares/validate';
import { optionalAuthenticate } from '../../middlewares/auth';
import { submissionRateLimiter } from '../../middlewares/rateLimiter';
import { submitResponseSchema } from '../../schemas/responseSchema';

const router = Router();

router.post(
  '/',
  submissionRateLimiter,
  optionalAuthenticate,
  validate({ body: submitResponseSchema }),
  submitResponse
);

router.get('/survey/:surveyId/results', getSurveyResults);
router.get('/survey/:surveyId', getAllResponses);

export default router;
