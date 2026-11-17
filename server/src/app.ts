import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { env } from './config/env';
import v1Routes from './routes/v1';
import legacySurveyRoutes from './routes/surveys';
import legacyResponseRoutes from './routes/responses';
import { apiRateLimiter } from './middlewares/rateLimiter';
import { requestLogger } from './middlewares/requestLogger';
import { errorHandler } from './middlewares/errorHandler';
import { NotFoundError } from './errors';

export const app = express();

// Security HTTP Headers
app.use(helmet());

// CORS Configuration
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
  })
);

// Body Parsing
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Request Logging (Development & Telemetry)
if (env.NODE_ENV !== 'test') {
  app.use(requestLogger);
}

// Global Rate Limiting for API routes
app.use('/api', apiRateLimiter);

// Health Check Endpoints
const healthHandler = (_req: Request, res: Response) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(isDbConnected ? 200 : 503).json({
    status: isDbConnected ? 'healthy' : 'unhealthy',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: isDbConnected ? 'connected' : 'disconnected',
    environment: env.NODE_ENV
  });
};

app.get('/healthz', healthHandler);
app.get('/api/healthz', healthHandler);

// Versioned API Routes (Target Architecture)
app.use('/api/v1', v1Routes);

// Legacy API Routes (Backwards Compatibility for existing client)
app.use('/api/surveys', legacySurveyRoutes);
app.use('/api/responses', legacyResponseRoutes);

// 404 Catch-All Handler
app.use((_req: Request, _res: Response) => {
  throw new NotFoundError('API endpoint not found');
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
