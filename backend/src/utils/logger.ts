import path from 'path';

// This Utility provides a central way to access the system logger
// It mimics the logic in index.ts to ensure consistency

const logger = process.env.NODE_ENV === 'production'
  ? require('../config/logger.prod').default
  : require('../config/logger.dev').default;

export default logger;
