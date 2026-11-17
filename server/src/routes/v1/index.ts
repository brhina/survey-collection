import { Router } from 'express';
import authRoutes from './authRoutes';
import surveyRoutes from './surveyRoutes';
import responseRoutes from './responseRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/surveys', surveyRoutes);
router.use('/responses', responseRoutes);

export default router;
