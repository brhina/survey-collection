import { app } from './app';
import { env } from './config/env';
import { connectDB, disconnectDB } from './config/db';

const startServer = async (): Promise<void> => {
  // Connect to database
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(`Survey server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    console.log(`Health check: http://localhost:${env.PORT}/healthz`);
    console.log(`API v1: http://localhost:${env.PORT}/api/v1`);
  });

  // Graceful Shutdown
  const gracefulShutdown = async (signal: string) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      console.log('HTTP server closed.');
      await disconnectDB();
      console.log('Database connection closed.');
      process.exit(0);
    });

    // Force close if graceful shutdown takes too long
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

startServer().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});

export default app;
