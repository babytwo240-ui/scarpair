export declare class ImageService {
    static uploadToS3(buffer: Buffer, originalName: string, userId: number, mimeType: string): Promise<string>;
    static deleteFromS3(imageUrl: string): Promise<void>;
    static getPresignedUrl(imageUrl: string, expiresIn?: number): Promise<string>;
    static validateImage(file: Express.Multer.File): {
        valid: boolean;
        error?: string;
    };
}
export default ImageService;
//# sourceMappingURL=imageService.d.ts.map