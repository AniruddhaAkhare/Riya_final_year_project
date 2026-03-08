import { S3Client } from "@aws-sdk/client-s3";

const region = import.meta.env.VITE_AWS_REGION;
const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
const bucketName = import.meta.env.VITE_S3_BUCKET_NAME;

// Validate all required environment variables
const validateConfig = () => {
  const missingVars = [];
  if (!region) missingVars.push('VITE_AWS_REGION');
  if (!accessKeyId) missingVars.push('VITE_AWS_ACCESS_KEY_ID');
  if (!secretAccessKey) missingVars.push('VITE_AWS_SECRET_ACCESS_KEY');
  if (!bucketName) missingVars.push('VITE_S3_BUCKET_NAME');
  
  if (missingVars.length > 0) {
    throw new Error(`Missing AWS configuration: ${missingVars.join(', ')}`);
  }
};

validateConfig();

export const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

// Debug function to verify configuration
export const debugS3Config = () => {
  return {
    region,
    bucketName,
    accessKeyId: accessKeyId ? '*****' + accessKeyId.slice(-4) : undefined,
    secretAccessKey: secretAccessKey ? '*****' + secretAccessKey.slice(-4) : undefined,
    configValid: !!(region && accessKeyId && secretAccessKey && bucketName)
  };
};