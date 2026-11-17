import { Router } from 'express';
import { register, login, getMe } from '../../controllers/authController';
import { validate } from '../../middlewares/validate';
import { authenticate } from '../../middlewares/auth';
import { authRateLimiter } from '../../middlewares/rateLimiter';
import { registerSchema, loginSchema } from '../../schemas/authSchema';

const router = Router();

router.post('/register', authRateLimiter, validate({ body: registerSchema }), register);
router.post('/login', authRateLimiter, validate({ body: loginSchema }), login);
router.get('/me', authenticate, getMe);

export default router;
