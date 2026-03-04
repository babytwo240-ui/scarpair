import { Multer } from 'multer';
import { Request, Response, NextFunction } from 'express';
export declare const IMAGE_CONFIG: {
    maxFileSize: number;
    maxImages: number;
    allowedMimes: string[];
    allowedExtensions: string[];
    uploadLimit: {
        perMinute: number;
        perHour: number;
    };
    compression: {
        quality: number;
        maxWidth: number;
        maxHeight: number;
    };
};
export declare const uploadMiddleware: Multer;
export declare function imageRateLimiter(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function compressImage(originalName: string, buffer?: Buffer): Promise<Buffer>;
export declare function generateS3Key(userId: number, originalName: string): string;
//# sourceMappingURL=imageUpload.d.ts.map