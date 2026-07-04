import express, { RequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { corsOptions } from './config/cors';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(compression() as unknown as RequestHandler);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined'));

app.get('/health', (req, res) => res.status(200).json({ status: 'OK', service: 'admin-api' }));
app.use('/api', routes);
app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` }));
app.use(errorHandler);

export default app;
