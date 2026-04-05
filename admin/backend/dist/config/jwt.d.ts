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
 * @param {string} username
 * @param {string} password
 * @returns {boolean}
 */
declare const verifyCredentials: (username: string, password: string) => boolean;
/**
 * @param {AdminPayload} payload
 * @returns {string}
 */
declare const generateToken: (payload: AdminPayload) => string;
/**
 * @param {string} token
 * @returns {AdminPayload | null}
 */
declare const verifyToken: (token: string) => AdminPayload | null;
export { ADMIN_CREDENTIALS, JWT_SECRET, JWT_EXPIRATION, verifyCredentials, generateToken, verifyToken };
export type { AdminPayload };
//# sourceMappingURL=jwt.d.ts.map