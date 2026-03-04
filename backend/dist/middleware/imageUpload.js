"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMiddleware = exports.IMAGE_CONFIG = void 0;
exports.imageRateLimiter = imageRateLimiter;
exports.compressImage = compressImage;
exports.generateS3Key = generateS3Key;
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
const redis_1 = __importDefault(require("../config/redis"));
exports.IMAGE_CONFIG = {
    maxFileSize: 5 * 1024 * 1024, // 5MB ra
    maxImages: 1, // 1 image per message
    allowedMimes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    uploadLimit: {
        perMinute: 5, // 5 images per minute
        perHour: 100 // 100MB per hour
    },
    compression: {
        quality: 80,
        maxWidth: 1920,
        maxHeight: 1920
    }
};
const storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, cb) => {
    // Validate MIME type
    if (!exports.IMAGE_CONFIG.allowedMimes.includes(file.mimetype)) {
        return cb(new Error(`❌ Invalid file type. Allowed: ${exports.IMAGE_CONFIG.allowedMimes.join(', ')}`));
    }
    const ext = (file.originalname.match(/\.[^.]*$/) || [''])[0].toLowerCase();
    if (!exports.IMAGE_CONFIG.allowedExtensions.includes(ext)) {
        return cb(new Error(`❌ Invalid file extension. Allowed: ${exports.IMAGE_CONFIG.allowedExtensions.join(', ')}`));
    }
    cb(null, true);
};
exports.uploadMiddleware = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: exports.IMAGE_CONFIG.maxFileSize,
        files: exports.IMAGE_CONFIG.maxImages
    }
});
async function imageRateLimiter(req, res, next) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const ip = req.ip || 'unknown';
        const minuteKey = `image:upload:${userId}:minute`;
        const minuteCount = await redis_1.default.incr(minuteKey);
        if (minuteCount === 1) {
            await redis_1.default.expire(minuteKey, 60);
        }
        if (minuteCount > exports.IMAGE_CONFIG.uploadLimit.perMinute) {
            res.status(429).json({
                error: 'Rate limit exceeded',
                message: `Maximum ${exports.IMAGE_CONFIG.uploadLimit.perMinute} images per minute`,
                retryAfter: 60
            });
            return;
        }
        const hourKey = `image:upload:${userId}:hour:size`;
        const fileSize = req.files?.[0]?.size || 0;
        const hourlySize = await redis_1.default.incrby(hourKey, Math.ceil(fileSize / 1024 / 1024)); // in MB
        if (hourlySize === Math.ceil(fileSize / 1024 / 1024)) {
            await redis_1.default.expire(hourKey, 3600);
        }
        if (hourlySize > exports.IMAGE_CONFIG.uploadLimit.perHour) {
            res.status(429).json({
                error: 'Rate limit exceeded',
                message: `Maximum ${exports.IMAGE_CONFIG.uploadLimit.perHour}MB per hour`,
                retryAfter: 3600,
                currentUsage: hourlySize
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error('Image rate limiter error:', error);
        next();
    }
}
async function compressImage(originalName, buffer) {
    try {
        console.log(`📦 Compressing image: ${originalName}`);
        const imageBuffer = buffer;
        if (!imageBuffer) {
            throw new Error('No image buffer provided for compression');
        }
        const compressed = await (0, sharp_1.default)(imageBuffer)
            .rotate()
            .resize(exports.IMAGE_CONFIG.compression.maxWidth, exports.IMAGE_CONFIG.compression.maxHeight, {
            fit: 'inside',
            withoutEnlargement: true
        })
            .toFormat('jpeg', { quality: exports.IMAGE_CONFIG.compression.quality, progressive: true })
            .toBuffer();
        const originalSize = (imageBuffer.length / 1024 / 1024).toFixed(2);
        const compressedSize = (compressed.length / 1024 / 1024).toFixed(2);
        const ratio = ((1 - compressed.length / imageBuffer.length) * 100).toFixed(1);
        console.log(`✅ Compression complete: ${originalSize}MB → ${compressedSize}MB (${ratio}% reduction)`);
        return compressed;
    }
    catch (error) {
        console.error('❌ Image compression error:', error);
        throw error;
    }
}
function generateS3Key(userId, originalName) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const sanitized = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `messages/${userId}/${timestamp}-${random}-${sanitized}`;
}
//# sourceMappingURL=imageUpload.js.map