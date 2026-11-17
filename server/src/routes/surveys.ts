import { Router } from 'express';
import {
  createSurvey,
  getAllSurveys,
  getSurveyById,
  updateSurvey,
  deleteSurvey
} from '../controllers/surveyController';
import { validate } from '../middlewares/validate';
import { createSurveySchema, updateSurveySchema } from '../schemas/surveySchema';

const router = Router();

router.post('/', validate({ body: createSurveySchema }), createSurvey);
router.get('/', getAllSurveys);
router.get('/:id', getSurveyById);
router.put('/:id', validate({ body: updateSurveySchema }), updateSurvey);
router.delete('/:id', deleteSurvey);

export default router;
