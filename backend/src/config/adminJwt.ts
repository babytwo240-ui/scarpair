import jwt, { Secret, SignOptions } from 'jsonwebtoken';

const ADMIN_JWT_SECRET: Secret = process.env.ADMIN_JWT_SECRET || 'your_super_secret_jwt_key_change_in_production';
const ADMIN_JWT_EXPIRATION = process.env.ADMIN_JWT_EXPIRATION || '24h';

interface AdminPayload {
  username: string;
  role: string;
  loginTime: string;
}
const verifyAdminToken = (token: string): AdminPayload | null => {
  try {
    return jwt.verify(token, ADMIN_JWT_SECRET) as AdminPayload;
  } catch (error) {
    return null;
  }
};

export { ADMIN_JWT_SECRET, ADMIN_JWT_EXPIRATION, verifyAdminToken };
export type { AdminPayload };
