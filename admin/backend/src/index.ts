import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load the correct .env file based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
dotenv.config({ path: path.join(__dirname, '..', envFile) });

// Load logger based on environment
const NODE_ENV = process.env.NODE_ENV || 'development';
const logger = NODE_ENV === 'production' 
  ? require('./config/logger.prod').default 
  : require('./config/logger.dev').default;

// Import Morgan middleware
import morganMiddleware from './config/morganConfig';

import adminRoutes from './routes/adminRoutes';

const app: Express = express();
const PORT = process.env.PORT || 5498;

// Middleware
app.use(cors());
app.use(express.json());
// HTTP request logging
app.use(morganMiddleware);

// Log server initialization
logger.info('🚀 Starting Scrapair Admin Backend Server...');
logger.info(`📋 Environment: ${NODE_ENV}`);
logger.info(`📧 Port: ${PORT}`);
logger.info('📝 HTTP request logging enabled');

// Routes
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Admin backend is running' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`${req.method} ${req.path} - Error: ${err.message}`);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const serverStartTime = Date.now();
const server = app.listen(PORT, () => {
  const baseUrl = process.env.ADMIN_BACKEND_BASE_URL || `http://localhost:${PORT}`;
  logger.info(`✨ Admin server running at ${baseUrl}`);
  logger.info(`📚 API available at ${baseUrl}/api/admin`);
});

// Handle server errors
server.on('error', (err: any) => {
  logger.error(`Server error: ${err.message}`, err);
});

export default app;

