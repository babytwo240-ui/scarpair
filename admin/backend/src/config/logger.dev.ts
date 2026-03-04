import winston from 'winston';
import path from 'path';

// Development log format - detailed for debugging
const devLogFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${stack ? '\n' + stack : ''}`;
  })
);

// Create logs directory for file storage
const logsDir = path.join(__dirname, '../../logs');

// Development transports: console + files
const devTransports: winston.transport[] = [
  // Colorized console for development
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ level, message, timestamp }) => {
        return `[${timestamp}] [${level}] ${message}`;
      })
    )
  }),
  // File logging for errors
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    maxsize: 10485760, // 10MB
    maxFiles: 5,
    format: devLogFormat
  }),
  // File logging for all messages
  new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    maxsize: 10485760, // 10MB
    maxFiles: 5,
    format: devLogFormat
  })
];

const devLogger = winston.createLogger({
  level: 'debug',
  format: devLogFormat,
  transports: devTransports,
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      format: devLogFormat
    })
  ]
});

export default devLogger;
