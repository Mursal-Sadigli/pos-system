import dotenv from 'dotenv';
import app from './app';
import { connectDB } from './config/database';
import { logger } from './config/logger';

dotenv.config();

const PORT = process.env.PORT || 5002;

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => logger.info(`🚀 Admin API running on port ${PORT}`));
  } catch (error) {
    logger.error('Server startup failed', error);
    process.exit(1);
  }
};

start();
