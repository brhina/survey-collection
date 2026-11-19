import { Router } from 'express';
import aiController from '../../controllers/aiController';
import { authenticate, optionalAuthenticate } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { DecisionOverrideSchema, AiChatQuerySchema } from '../../ai/schemas/aiAnalysisSchema';

const router = Router({ mergeParams: true });

// Synchronous analysis generation & retrieval
router.post('/analyze', optionalAuthenticate, aiController.analyzeCollector);

// Real-time Server-Sent Events (SSE) streaming
router.get('/stream', optionalAuthenticate, aiController.streamCollectorAnalysis);
router.post('/stream', optionalAuthenticate, aiController.streamCollectorAnalysis);

// Fetch latest cached/persisted analysis
router.get('/latest', optionalAuthenticate, aiController.getLatestAnalysis);

// Human-in-the-Loop: Overriding decisions (strictly requires authentication)
router.post(
  '/decision/override',
  authenticate,
  validate({ body: DecisionOverrideSchema }),
  aiController.overrideDecision
);

// Conversational AI: Ask questions regarding this collector's dataset
router.post(
  '/chat',
  optionalAuthenticate,
  validate({ body: AiChatQuerySchema }),
  aiController.chatWithCollector
);

export default router;
