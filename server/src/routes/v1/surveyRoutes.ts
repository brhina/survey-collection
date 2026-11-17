import { Router } from 'express';
import {
  createSurvey,
  getAllSurveys,
  getSurveyById,
  updateSurvey,
  deleteSurvey,
  exportSurvey
} from '../../controllers/surveyController';
import { validate } from '../../middlewares/validate';
import { authenticate, optionalAuthenticate } from '../../middlewares/auth';
import {
  createSurveySchema,
  surveyQuerySchema,
  updateSurveySchema
} from '../../schemas/surveySchema';

const router = Router();

router.post(
  '/',
  authenticate,
  validate({ body: createSurveySchema }),
  createSurvey
);

router.get(
  '/',
  optionalAuthenticate,
  validate({ query: surveyQuerySchema }),
  getAllSurveys
);

router.get('/:id', getSurveyById);

router.put(
  '/:id',
  authenticate,
  validate({ body: updateSurveySchema }),
  updateSurvey
);

router.delete('/:id', authenticate, deleteSurvey);

router.get('/:id/export', exportSurvey);

export default router;
