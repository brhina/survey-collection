import { Router } from 'express';
import {
  submitResponse,
  getSurveyResults,
  getAllResponses,
  checkEligibility
} from '../../controllers/responseController';
import { validate } from '../../middlewares/validate';
import { optionalAuthenticate } from '../../middlewares/auth';
import { submissionRateLimiter } from '../../middlewares/rateLimiter';
import { submitResponseSchema, checkEligibilityQuerySchema } from '../../schemas/responseSchema';

const router = Router();

router.get(
  '/check-eligibility',
  optionalAuthenticate,
  validate({ query: checkEligibilityQuerySchema }),
  checkEligibility
);

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
