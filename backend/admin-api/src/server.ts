import dotenv from 'dotenv';
import { httpServer } from './sockets/index';
import { connectDB } from './config/database';
import { logger } from './config/logger';

import { CronService } from './services/cron.service';

dotenv.config();

const PORT = process.env.PORT || 5002;

const start = async () => {
  try {
    await connectDB();
    CronService.init();
    httpServer.listen(PORT, () => logger.info(`🚀 Admin API running on port ${PORT}`));
  } catch (error) {
    logger.error('Server startup failed', error);
    process.exit(1);
  }
};

start();
