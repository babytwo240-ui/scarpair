import { Secret } from 'jsonwebtoken';
declare const JWT_SECRET: Secret;
declare const JWT_EXPIRATION: string;
declare const REFRESH_TOKEN_SECRET: Secret;
declare const REFRESH_TOKEN_EXPIRATION: string;
interface UserPayload {
    id: number;
    email: string;
    businessName?: string;
    companyName?: string;
    type: 'business' | 'recycler';
}
declare const generateUserToken: (payload: UserPayload) => string;
declare const generateRefreshToken: (payload: UserPayload) => string;
declare const verifyUserToken: (token: string) => UserPayload | null;
declare const verifyRefreshToken: (token: string) => UserPayload | null;
export { JWT_SECRET, JWT_EXPIRATION, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRATION, generateUserToken, generateRefreshToken, verifyUserToken, verifyRefreshToken };
export type { UserPayload };
//# sourceMappingURL=userJwt.d.ts.map