import morgan from 'morgan';
import { Request, Response } from 'express';

// Load logger based on environment
const NODE_ENV = process.env.NODE_ENV || 'development';
const logger = NODE_ENV === 'production' 
  ? require('./logger.prod').default 
  : require('./logger.dev').default;

// Custom token for response time in milliseconds
morgan.token('response-time-ms', (req: any, res: any) => {
  if (!(res as any)._header) return '';
  const diff = Date.now() - ((req as any)._startTime || Date.now());
  return diff.toString();
});

// HTTP request logging format
const httpLogFormat = ':method :url :status :response-time-ms ms - :res[content-length] bytes';

// Create Morgan middleware with Winston integration
const morganMiddleware = morgan(httpLogFormat, {
  stream: {
    write: (message: string) => {
      // Skip health checks
      if (message.includes('/api/health') || message.includes('/health')) {
        return;
      }
      
      // In production, skip detailed HTTP logs (keep it clean)
      if (NODE_ENV === 'production') {
        return;
      }
      
      // Log to Winston in development
      logger.info(message.trim());
    }
  },
  skip: (req: Request, res: Response) => {
    // Skip health checks and status endpoints
    return req.path === '/api/health' || req.path === '/health' || req.path === '/status';
  }
});

export default morganMiddleware;
