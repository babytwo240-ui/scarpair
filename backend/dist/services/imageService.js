"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageService = void 0;
const aws_1 = __importStar(require("../config/aws"));
const imageUpload_1 = require("../middleware/imageUpload");
class ImageService {
    static async uploadToS3(buffer, originalName, userId, mimeType) {
        try {
            if (!aws_1.supabaseConfig.url || !aws_1.supabaseConfig.serviceRoleKey) {
                console.warn('⚠️  Supabase not configured. Returning placeholder URL.');
                return `data:${mimeType};base64,${buffer.toString('base64').substring(0, 50)}...`;
            }
            const compressed = await (0, imageUpload_1.compressImage)(originalName, buffer);
            const fileName = (0, imageUpload_1.generateS3Key)(userId, originalName);
            const filePath = `${aws_1.supabaseConfig.bucket}/${fileName}`;
            console.log(`🔼 Uploading to Supabase: ${filePath}`);
            const { data, error } = await aws_1.default.storage
                .from(aws_1.supabaseConfig.bucket)
                .upload(fileName, compressed, {
                cacheControl: '31536000',
                upsert: false,
                contentType: 'image/jpeg'
            });
            if (error) {
                console.error('❌ Supabase upload error:', error);
                throw error;
            }
            const { data: publicData } = aws_1.default.storage
                .from(aws_1.supabaseConfig.bucket)
                .getPublicUrl(fileName);
            const imageUrl = publicData.publicUrl;
            console.log(`✅ Uploaded to Supabase: ${imageUrl}`);
            return imageUrl;
        }
        catch (error) {
            console.error('❌ Image upload service error:', error);
            throw error;
        }
    }
    static async deleteFromS3(imageUrl) {
        try {
            if (!aws_1.supabaseConfig.url || !aws_1.supabaseConfig.serviceRoleKey) {
                console.warn(`⚠️  Supabase not configured. Skipping deletion for: ${imageUrl}`);
                return;
            }
            const urlParts = imageUrl.split('/');
            const fileName = urlParts[urlParts.length - 1];
            if (!fileName) {
                console.warn(`⚠️  Could not extract file name from URL: ${imageUrl}`);
                return;
            }
            console.log(`🗑️  Deleting from Supabase: ${fileName}`);
            const { error } = await aws_1.default.storage
                .from(aws_1.supabaseConfig.bucket)
                .remove([fileName]);
            if (error) {
                console.error('❌ Supabase delete error:', error);
                throw error;
            }
            console.log(`✅ Deleted from Supabase: ${fileName}`);
        }
        catch (error) {
            console.error('❌ Image deletion service error:', error);
            throw error;
        }
    }
    static async getPresignedUrl(imageUrl, expiresIn = 3600) {
        try {
            console.log(`🔐 Using public URL (valid indefinitely)`);
            return imageUrl;
        }
        catch (error) {
            console.error('❌ Get presigned URL error:', error);
            throw error;
        }
    }
    static validateImage(file) {
        if (!file) {
            return { valid: false, error: 'No file provided' };
        }
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedMimes.includes(file.mimetype)) {
            return { valid: false, error: `Invalid MIME type: ${file.mimetype}` };
        }
        if (file.size > 5 * 1024 * 1024) {
            const sizeMB = (file.size / 1024 / 1024).toFixed(2);
            return { valid: false, error: `File too large: ${sizeMB}MB (max 5MB)` };
        }
        return { valid: true };
    }
}
exports.ImageService = ImageService;
exports.default = ImageService;
//# sourceMappingURL=imageService.js.map