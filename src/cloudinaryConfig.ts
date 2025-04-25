import { Cloudinary } from '@cloudinary/url-gen';

// Read credentials from environment variables
const cloudinaryConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
  apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET
};

const cld = new Cloudinary({
  cloud: {
    cloudName: cloudinaryConfig.cloudName
  }
});

export { cld, cloudinaryConfig };