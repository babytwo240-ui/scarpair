import { Secret } from 'jsonwebtoken';
declare const ADMIN_JWT_SECRET: Secret;
declare const ADMIN_JWT_EXPIRATION: string;
interface AdminPayload {
    username: string;
    role: string;
    loginTime: string;
}
declare const verifyAdminToken: (token: string) => AdminPayload | null;
export { ADMIN_JWT_SECRET, ADMIN_JWT_EXPIRATION, verifyAdminToken };
export type { AdminPayload };
//# sourceMappingURL=adminJwt.d.ts.map