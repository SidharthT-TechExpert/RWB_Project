import api from './api';

export interface UploadResult {
  url: string;
  publicId?: string;
  format?: string;
  width?: number;
  height?: number;
}

/**
 * Converts a browser File object to a base64 Data URI string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Upload an image file to Cloudinary via backend API
 */
export async function uploadImageToCloudinary(
  file: File,
  folder: string = 'quickbite/food'
): Promise<UploadResult> {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file (PNG, JPG, WEBP, etc.)');
  }

  // Validate file size (max 8MB)
  const maxSize = 8 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('Image size exceeds 8MB limit. Please upload a smaller image.');
  }

  // Convert to base64
  const base64Data = await fileToBase64(file);

  // Send to backend upload endpoint
  const response = await api.post('/upload/image', {
    image: base64Data,
    folder,
  });

  if (response.data && response.data.data) {
    return response.data.data;
  }

  throw new Error('Unexpected response format from upload server');
}
