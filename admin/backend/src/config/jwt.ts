import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
dotenv.config({ path: path.join(__dirname, '../../', envFile) });

const NODE_ENV = process.env.NODE_ENV || 'development';

interface AdminCredentials {
  username: string;
  password: string;
}

const ADMIN_CREDENTIALS: AdminCredentials = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || ''
};

// Validate admin credentials are properly configured
if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === '') {
  if (NODE_ENV === 'production') {
    throw new Error('❌ CRITICAL: ADMIN_PASSWORD must be set in production environment');
  }
}

// Validate JWT_SECRET
const JWT_SECRET: Secret = process.env.JWT_SECRET || (NODE_ENV === 'development' ? 'dev_jwt_secret_key_12345678' : '');

if (!process.env.JWT_SECRET && NODE_ENV === 'production') {
  throw new Error('❌ CRITICAL: JWT_SECRET must be set in production environment');
}

const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';

interface AdminPayload {
  username: string;
  role: string;
  loginTime: string;
}

/**
 * @param {string} username
 * @param {string} password
 * @returns {boolean}
 */
const verifyCredentials = (username: string, password: string): boolean => {
  return username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password;
};

/**
 * @param {AdminPayload} payload 
 * @returns {string} 
 */
const generateToken = (payload: AdminPayload): string => {
  const options: SignOptions = { expiresIn: JWT_EXPIRATION } as any;
  return jwt.sign(payload, JWT_SECRET as string, options);
};

/**
 * @param {string} token
 * @returns {AdminPayload | null} 
 */
const verifyToken = (token: string): AdminPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminPayload;
  } catch (error) {
    return null;
  }
};

export { ADMIN_CREDENTIALS, JWT_SECRET, JWT_EXPIRATION, verifyCredentials, generateToken, verifyToken };
export type { AdminPayload };
