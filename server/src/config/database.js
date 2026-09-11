import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

export const connectDatabase = async () => {
  try {
    const maskedUri = env.MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    logger.info(`Connecting to MongoDB at ${maskedUri}...`);

    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    logger.info(`🌿 MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error('❌ MongoDB Connection Error:', { error: error.message });
    if (env.NODE_ENV === 'test') {
      throw error;
    }
    process.exit(1);
  }
};

export const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    logger.info('HTTP & MongoDB connections closed gracefully.');
  } catch (error) {
    logger.error('Error during database disconnection:', { error: error.message });
  }
};

export const runInTransaction = async (callback) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const result = await callback(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
