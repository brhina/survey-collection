import { Router } from 'express';
import {
  createSurvey,
  getAllSurveys,
  getSurveyById,
  updateSurvey,
  deleteSurvey,
  exportSurvey
} from '../../controllers/surveyController';
import aiRoutes from './aiRoutes';
import { validate } from '../../middlewares/validate';
import { authenticate, optionalAuthenticate } from '../../middlewares/auth';
import {
  createSurveySchema,
  surveyQuerySchema,
  updateSurveySchema,
  updateSurveyStatusSchema
} from '../../schemas/surveySchema';

const router = Router();

// Mount AI Decision & Analytics sub-router for collectors
router.use('/:surveyId/ai', aiRoutes);
router.use('/:id/ai', aiRoutes);

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

router.patch(
  '/:id',
  authenticate,
  validate({ body: updateSurveySchema }),
  updateSurvey
);

router.patch(
  '/:id/status',
  authenticate,
  validate({ body: updateSurveyStatusSchema }),
  updateSurvey
);

router.delete('/:id', authenticate, deleteSurvey);

router.get('/:id/export', exportSurvey);

export default router;
