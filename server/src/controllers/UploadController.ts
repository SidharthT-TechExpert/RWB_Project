import { Request, Response, NextFunction } from 'express';
import { cloudinaryService } from '../services/CloudinaryService';
import { sendSuccess } from '../utils/response';
import { ValidationError } from '../errors';

export class UploadController {
  async uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { image, folder } = req.body;
      if (!image) {
        throw new ValidationError('Image data (base64 string or data URI) is required');
      }

      const result = await cloudinaryService.uploadImage(image, folder || 'quickbite/food');
      sendSuccess(res, 'Image uploaded successfully to Cloudinary', result, 201);
    } catch (error) {
      next(error);
    }
  }
}

export const uploadController = new UploadController();
