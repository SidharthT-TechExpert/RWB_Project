import { Router } from 'express';
import { uploadController } from '../controllers/UploadController';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

// Allow authenticated users (owners, managers, admins, users) to upload images to Cloudinary
router.post('/image', authenticate, uploadController.uploadImage.bind(uploadController));

export default router;
