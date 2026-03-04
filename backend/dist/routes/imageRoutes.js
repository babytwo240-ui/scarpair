"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const imageUpload_1 = require("../middleware/imageUpload");
const userAuthMiddleware_1 = require("../middleware/userAuthMiddleware");
const imageService_1 = __importDefault(require("../services/imageService"));
const router = (0, express_1.Router)();
router.post('/upload', userAuthMiddleware_1.authenticateUser, imageUpload_1.imageRateLimiter, imageUpload_1.uploadMiddleware.single('file'), async (req, res) => {
    try {
        const userId = req.user.id;
        const file = req.file;
        const validation = imageService_1.default.validateImage(file);
        if (!validation.valid) {
            res.status(400).json({ error: validation.error });
            return;
        }
        const imageUrl = await imageService_1.default.uploadToS3(file.buffer, file.originalname, userId, file.mimetype);
        res.status(200).json({
            message: 'Image uploaded successfully',
            data: {
                url: imageUrl,
                size: file.size,
                mimetype: file.mimetype,
                uploadedBy: userId,
                uploadedAt: new Date().toISOString()
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to upload image' });
    }
});
router.delete('/:imageUrl', userAuthMiddleware_1.authenticateUser, async (req, res) => {
    try {
        const { imageUrl } = req.params;
        const decodedUrl = decodeURIComponent(imageUrl);
        await imageService_1.default.deleteFromS3(decodedUrl);
        res.status(200).json({
            message: 'Image deleted successfully'
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete image' });
    }
});
exports.default = router;
//# sourceMappingURL=imageRoutes.js.map