import { Router, Request, Response } from 'express';
import { uploadMiddleware, imageRateLimiter } from '../middleware/imageUpload';
import { authenticateUser } from '../middleware/userAuthMiddleware';
import ImageService from '../services/imageService';

const router = Router();

router.post(
  '/upload',
  authenticateUser,
  imageRateLimiter,
  uploadMiddleware.single('file'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const file = (req as any).file;

      const validation = ImageService.validateImage(file!);
      if (!validation.valid) {
        res.status(400).json({ error: validation.error });
        return;
      }

      const imageUrl = await ImageService.uploadToS3(
        file!.buffer,
        file!.originalname,
        userId,
        file!.mimetype
      );

      res.status(200).json({
        message: 'Image uploaded successfully',
        data: {
          url: imageUrl,
          size: file!.size,
          mimetype: file!.mimetype,
          uploadedBy: userId,
          uploadedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  }
);

router.delete(
  '/:imageUrl',
  authenticateUser,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { imageUrl } = req.params;
      const decodedUrl = decodeURIComponent(imageUrl);

      await ImageService.deleteFromS3(decodedUrl);

      res.status(200).json({
        message: 'Image deleted successfully'
      });
    } catch (error) {
      console.error('Image deletion error:', error);
      res.status(500).json({ error: 'Failed to delete image' });
    }
  }
);

export default router;
