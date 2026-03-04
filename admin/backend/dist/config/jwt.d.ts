import { Secret } from 'jsonwebtoken';
interface AdminCredentials {
    username: string;
    password: string;
}
declare const ADMIN_CREDENTIALS: AdminCredentials;
declare const JWT_SECRET: Secret;
declare const JWT_EXPIRATION: string;
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
declare const verifyCredentials: (username: string, password: string) => boolean;
/**
 * Generate JWT token
 * @param {AdminPayload} payload - Token payload
 * @returns {string} JWT token
 */
declare const generateToken: (payload: AdminPayload) => string;
/**
 * Verify JWT token
 * @param {string} token
 * @returns {AdminPayload | null} Decoded token or null if invalid
 */
declare const verifyToken: (token: string) => AdminPayload | null;
export { ADMIN_CREDENTIALS, JWT_SECRET, JWT_EXPIRATION, verifyCredentials, generateToken, verifyToken };
export type { AdminPayload };
//# sourceMappingURL=jwt.d.ts.map