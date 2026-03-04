import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import morganMiddleware from './config/morganConfig';
import adminRoutes from './routes/adminRoutes';

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
dotenv.config({ path: path.join(__dirname, '..', envFile) });
const NODE_ENV = process.env.NODE_ENV || 'development';
const logger = NODE_ENV === 'production' ? require('./config/logger.prod').default : require('./config/logger.dev').default;
const app: Express = express();
const PORT = process.env.PORT || 5498;
const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:4000,http://127.0.0.1:4000').split(',').map(origin => origin.trim());

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morganMiddleware);

logger.info('🚀 Starting Scrapair Admin Backend Server...');
logger.info(`📋 Environment: ${NODE_ENV}`);
logger.info(`📧 Port: ${PORT}`);
logger.info('📝 HTTP request logging enabled');

app.use('/api/admin', adminRoutes);

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Admin backend is running' });
});

app.use((req: Request, res: Response) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Route not found' });
});
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`${req.method} ${req.path} - Error: ${err.message}`);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
});

const serverStartTime = Date.now();
const server = app.listen(PORT, () => {
  const baseUrl = process.env.ADMIN_BACKEND_BASE_URL || `http://localhost:${PORT}`;
  logger.info(`✨ Admin server running at ${baseUrl}`);
  logger.info(`📚 API available at ${baseUrl}/api/admin`);
});

server.on('error', (err: any) => {
  logger.error(`Server error: ${err.message}`, err);
});

export default app;

