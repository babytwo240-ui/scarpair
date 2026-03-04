import winston from 'winston';

// Production log format - clean and minimal
const prodLogFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${stack ? '\n' + stack : ''}`;
  })
);

// Production transports: console only (Render captures stdout)
const prodTransports: winston.transport[] = [
  // Plain console for production (no colors, Render handles output)
  new winston.transports.Console({
    format: prodLogFormat
  })
];

const prodLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'warn', // Only warnings and errors in production
  format: prodLogFormat,
  transports: prodTransports,
  exceptionHandlers: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.printf(({ level, message, timestamp, stack }) => {
          return `[${timestamp}] [${level.toUpperCase()}] UNCAUGHT EXCEPTION: ${message}${stack ? '\n' + stack : ''}`;
        })
      )
    })
  ]
});

export default prodLogger;
