import { createApp, connectDatabase } from './app.js';
import { env } from './config/env.js';

const app = createApp();

const shutdown = (signal: string): void => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  process.exit(0);
};

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    app.listen(env.PORT, () => {
      console.log(`🚀 Server running on port ${env.PORT}`);
      console.log(`📍 Health check: http://localhost:${env.PORT}${env.API_PREFIX}/health`);
      console.log(`🌍 Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

void startServer();
