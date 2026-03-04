import jwt, { Secret, SignOptions } from 'jsonwebtoken';

// Admin credentials (hardcoded for now - can be moved to database later)
interface AdminCredentials {
  username: string;
  password: string;
}

const ADMIN_CREDENTIALS: AdminCredentials = {
  username: 'admin11',
  password: 'asdqwe123'
};

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';

interface AdminPayload {
  username: string;
  role: string;
  loginTime: string;
}

/**
 * Verify admin credentials
 * @param {string} username
 * @param {string} password
 * @returns {boolean}
 */
const verifyCredentials = (username: string, password: string): boolean => {
  return username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password;
};

/**
 * Generate JWT token
 * @param {AdminPayload} payload - Token payload
 * @returns {string} JWT token
 */
const generateToken = (payload: AdminPayload): string => {
  const options: SignOptions = { expiresIn: JWT_EXPIRATION } as any;
  return jwt.sign(payload, JWT_SECRET as string, options);
};

/**
 * Verify JWT token
 * @param {string} token
 * @returns {AdminPayload | null} Decoded token or null if invalid
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
