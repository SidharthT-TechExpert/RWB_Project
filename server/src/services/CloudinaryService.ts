import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

export class CloudinaryService {
  private isConfigured: boolean = false;

  constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
      this.isConfigured = true;
      console.log('✅ Cloudinary configured successfully');
    } else {
      console.warn('⚠️ Cloudinary environment variables missing (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET). Using fallback mock upload.');
    }
  }

  /**
   * Upload an image (base64 data URI, URL, or file path) to Cloudinary
   */
  async uploadImage(
    fileData: string,
    folder: string = 'quickbite/food'
  ): Promise<{
    url: string;
    publicId: string;
    format?: string;
    width?: number;
    height?: number;
  }> {
    if (!fileData) {
      throw new Error('No image data provided for upload');
    }

    if (!this.isConfigured) {
      // If Cloudinary keys are not configured in local environment,
      // return a valid fallback URL so development / testing is never blocked
      console.warn('⚠️ Cloudinary not configured. Returning data URL or sample food image.');
      if (fileData.startsWith('http://') || fileData.startsWith('https://')) {
        return {
          url: fileData,
          publicId: `local_${Date.now()}`,
        };
      }
      // If it's a data URL or raw image, in mock mode return a placeholder or direct data URI
      return {
        url: fileData.startsWith('data:') ? fileData : `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80`,
        publicId: `mock_${Date.now()}`,
      };
    }

    try {
      const result: UploadApiResponse = await cloudinary.uploader.upload(fileData, {
        folder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
      };
    } catch (error: any) {
      console.error('❌ Cloudinary upload error:', error);
      throw new Error(`Failed to upload image to Cloudinary: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Delete an image from Cloudinary by public ID
   */
  async deleteImage(publicId: string): Promise<boolean> {
    if (!this.isConfigured || !publicId) return false;
    try {
      await cloudinary.uploader.destroy(publicId);
      return true;
    } catch (error) {
      console.error('❌ Cloudinary delete error:', error);
      return false;
    }
  }
}

export const cloudinaryService = new CloudinaryService();
