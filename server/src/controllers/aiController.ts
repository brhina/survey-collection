import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import aiOrchestratorService from '../ai/services/aiOrchestratorService';
import aiChatService from '../ai/services/aiChatService';
import { DecisionOverrideSchema, AiChatQuerySchema } from '../ai/schemas/aiAnalysisSchema';
import { BadRequestError } from '../errors';

/**
 * Controller: AI Decision & Semantic Analysis Handlers
 */
export class AiController {
  /**
   * POST /api/v1/surveys/:surveyId/ai/analyze
   * Synchronous analysis generation (or retrieval from cache).
   */
  public analyzeCollector = asyncHandler(async (req: Request, res: Response) => {
    const surveyId = String(req.params.surveyId || req.params.id);
    const forceRefresh = req.query.forceRefresh === 'true';

    const result = await aiOrchestratorService.generateCollectorAnalysis(surveyId, {
      forceRefresh
    });

    ApiResponse.success(
      res,
      result,
      result.cached ? 'Loaded analysis from intelligent cache' : 'Generated fresh AI decision analysis'
    );
  });

  /**
   * GET /api/v1/surveys/:surveyId/ai/stream
   * Real-time Server-Sent Events (SSE) streaming of lifecycle phases and generated decisions.
   */
  public streamCollectorAnalysis = asyncHandler(async (req: Request, res: Response) => {
    const surveyId = String(req.params.surveyId || req.params.id);
    const forceRefresh = req.query.forceRefresh === 'true';

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable proxy buffering (Nginx)
    res.flushHeaders();

    const sendEvent = (event: string, data: any) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    try {
      sendEvent('phase', { phase: 'START', message: 'Connecting to AI orchestration service...' });

      const result = await aiOrchestratorService.generateCollectorAnalysis(surveyId, {
        forceRefresh,
        onStreamPhase: (phase, message) => {
          sendEvent('phase', { phase, message });
        }
      });

      sendEvent('complete', result);
      res.write('event: end\ndata: {}\n\n');
      res.end();
    } catch (err: any) {
      sendEvent('error', { message: err?.message || 'AI generation failed' });
      res.end();
    }
  });

  /**
   * GET /api/v1/surveys/:surveyId/ai/latest
   * Retrieves the most recent persisted analysis.
   */
  public getLatestAnalysis = asyncHandler(async (req: Request, res: Response) => {
    const surveyId = String(req.params.surveyId || req.params.id);
    const result = await aiOrchestratorService.getLatestAnalysis(surveyId);

    if (!result) {
      return ApiResponse.success(res, null, 'No previous AI analysis recorded for this collector', 200);
    }

    ApiResponse.success(res, result, 'Retrieved latest AI analysis');
  });

  /**
   * POST /api/v1/surveys/:surveyId/ai/decision/override
   * Human-in-the-Loop: Records a formal human verdict override.
   */
  public overrideDecision = asyncHandler(async (req: Request, res: Response) => {
    const surveyId = String(req.params.surveyId || req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      throw new BadRequestError('User authentication required to record an override');
    }

    const validatedInput = DecisionOverrideSchema.parse(req.body);
    const updated = await aiOrchestratorService.recordDecisionOverride(
      surveyId,
      validatedInput,
      userId
    );

    ApiResponse.success(
      res,
      {
        id: updated._id,
        analysis: updated.analysis,
        humanOverride: updated.humanOverride
      },
      'Decision override successfully recorded in audit ledger'
    );
  });

  /**
   * POST /api/v1/surveys/:surveyId/ai/chat
   * Interactive Q&A regarding this collector's dataset.
   */
  public chatWithCollector = asyncHandler(async (req: Request, res: Response) => {
    const surveyId = String(req.params.surveyId || req.params.id);
    const validated = AiChatQuerySchema.parse(req.body);

    const chatResponse = await aiChatService.askQuestion(
      surveyId,
      validated.question,
      validated.history
    );

    ApiResponse.success(res, chatResponse, 'Chat response generated');
  });
}

export const aiController = new AiController();
export default aiController;
