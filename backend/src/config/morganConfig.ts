import morgan from 'morgan';

// Dynamically load the appropriate logger based on environment
const logger = process.env.NODE_ENV === 'production'
  ? require('./logger.prod').default
  : require('./logger.dev').default;

// Custom Morgan token for response time
morgan.token('response-time-ms', (req: any, res: any) => {
  if (!res._header || !req._startTime) return '0ms';
  return `${Date.now() - req._startTime}ms`;
});

// Create a stream for Morgan to write to Winston logger
const stream = {
  write: (message: string) => {
    // In production, only log if level is warn or higher
    if (process.env.NODE_ENV === 'production') {
      // Skip HTTP logs in production (too verbose)
      return;
    }
    logger.info(message.trim());
  }
};

// Configure Morgan with custom format
const morganMiddleware = morgan(
  ':method :url :status :response-time-ms - :res[content-length] bytes',
  {
    stream: stream,
    skip: (req: any) => {
      // Skip logging for health checks in both dev and prod
      return req.path === '/api/health' || req.path === '/health';
    }
  }
);

export default morganMiddleware;
