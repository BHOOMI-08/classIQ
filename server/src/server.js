import http from 'http';
import app from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { initSocketServer } from './socket/socket.server.js';
import { startSessionExpiryWorker, stopSessionExpiryWorker } from './workers/sessionExpiryWorker.js';
import { verifyDatabaseIndexes } from './config/databaseIndexes.js';
import { AssignmentLifecycleWorker } from './modules/assignments/workers/assignmentLifecycleWorker.js';
import { MissingSubmissionWorker } from './modules/assignments/workers/missingSubmissionWorker.js';
import { QuizLifecycleWorker } from './modules/quizzes/workers/quizLifecycle.worker.js';
import { AttemptExpiryWorker } from './modules/quizzes/workers/attemptExpiry.worker.js';
import { QuizGradingWorker } from './modules/quizzes/workers/quizGrading.worker.js';
import { QuizAnalyticsWorker } from './modules/quizzes/workers/quizAnalytics.worker.js';

const startServer = async () => {
  await connectDatabase();
  await verifyDatabaseIndexes();

  const server = http.createServer(app);
  initSocketServer(server);

  // Start background workers
  startSessionExpiryWorker(30000);
  AssignmentLifecycleWorker.startWorker();
  MissingSubmissionWorker.startWorker();
  QuizLifecycleWorker.startWorker();
  AttemptExpiryWorker.startWorker();
  QuizGradingWorker.startWorker();
  QuizAnalyticsWorker.startWorker();
  logger.info('⚙️  Module 6 Quiz workers started');

  server.listen(env.PORT, () => {
    logger.info(`🚀 ClassIQ Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    logger.info(`📡 Client origin allowed: ${env.CLIENT_URL}`);
  });

  const shutdown = async (signal) => {
    logger.info(`Shutting down server gracefully due to ${signal}...`);
    stopSessionExpiryWorker();
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('uncaughtException', (error) => {
    logger.error('💥 Uncaught Exception:', { error: error.message, stack: error.stack });
    shutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('💥 Unhandled Rejection:', { reason });
  });
};

startServer();
