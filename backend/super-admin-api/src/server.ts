import app from './app';
import { logger } from './utils/logger';
import { connectDB } from './config/database';
import { redisClient } from './config/redis';
import { createServer } from 'http';
import { setupSocket } from './socket';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5002;

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

const startServer = async () => {
  try {
    // Database connection
    await connectDB();
    logger.info('✅ Database connected');

    // Redis connection (only connect if not already connecting/connected)
    try {
      const status = (redisClient as any).status;
      if (status !== 'ready' && status !== 'connecting') {
        await redisClient.connect();
      }
      logger.info('✅ Redis connected');
    } catch (err) {
      logger.warn('⚠️ Redis connection skipped or failed:', err);
    }

    // Create HTTP server
    const httpServer = createServer(app);

    // Socket.io setup
    setupSocket(httpServer);

    // Start server
    httpServer.listen(PORT, () => {
      logger.info(`🚀 Super Admin API running on port ${PORT}`);
      logger.info(`📚 API: http://localhost:${PORT}/api`);
      logger.info(`❤️  Health: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = async () => {
      logger.info('🛑 Shutting down gracefully...');
      httpServer.close(async () => {
        await redisClient.quit();
        logger.info('✅ Redis disconnected');
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    logger.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

startServer();