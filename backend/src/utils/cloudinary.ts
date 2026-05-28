import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a Base64 data URL string directly to Cloudinary and return the secure hosting URL.
 */
export const uploadBase64ToCloudinary = async (base64Str: string, userId?: string): Promise<string> => {
  try {
    if (!base64Str || !base64Str.startsWith('data:')) {
      // If it's already a hosted URL, just return it directly
      return base64Str;
    }
    
    console.log('[Cloudinary] Uploading base64 image...');
    const options: any = {
      folder: 'codeyx_project_showcases',
      resource_type: 'image',
    };
    if (userId) {
      options.tags = [userId];
    }
    const result = await cloudinary.uploader.upload(base64Str, options);
    console.log('[Cloudinary] Successfully uploaded. URL:', result.secure_url);
    return result.secure_url;
  } catch (error: any) {
    console.error('[Cloudinary Error] Failed to upload image:', error.message || error);
    throw new Error('Failed to upload project photo to Cloudinary.');
  }
};
