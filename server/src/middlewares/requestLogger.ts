import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  const { method, originalUrl } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const color =
      statusCode >= 500
        ? '\x1b[31m' // Red
        : statusCode >= 400
        ? '\x1b[33m' // Yellow
        : statusCode >= 300
        ? '\x1b[36m' // Cyan
        : '\x1b[32m'; // Green
    const reset = '\x1b[0m';

    console.log(
      `[HTTP] ${method.padEnd(6)} ${originalUrl.padEnd(35)} ${color}${statusCode}${reset} (${duration}ms)`
    );
  });

  next();
};

export default requestLogger;
