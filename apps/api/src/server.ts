import { createApp, connectDatabase } from './app.js';
import { createSocketServer } from './sockets/index.js';
import { env } from './config/env.js';
import { createServer } from 'http';

const app = createApp();
const httpServer = createServer(app);

const shutdown = (signal: string): void => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
};

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    // Initialize Socket.io
    createSocketServer(httpServer);

    httpServer.listen(env.PORT, () => {
      console.log(`🚀 Server running on port ${env.PORT}`);
      console.log(`📍 Health check: http://localhost:${env.PORT}${env.API_PREFIX}/health`);
      console.log(`🌍 Environment: ${env.NODE_ENV}`);
      console.log(`⚡ Socket.io enabled`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

void startServer();
