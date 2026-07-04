import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { corsOptions } from './config/cors';
import { logger } from './utils/logger';
import { AuthController } from './controllers/auth.controller';
import routes from './routes';


import { errorHandler } from './middleware/error.middleware';
import { rateLimiter } from './middleware/rateLimit.middleware';
import { authenticate } from './middleware/auth.middleware';

dotenv.config();

const app = express();
app.post('/login', AuthController.login);

// Security middleware
app.use(helmet());

// CORS
app.use(cors(corsOptions));

// Compression
app.use(compression());

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) }
}));

// Rate limiting
app.use('/api', rateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'super-admin-api',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handler
app.use(errorHandler);

export default app;