// S3 Upload Service
// This service handles uploading audio files directly to AWS S3

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

interface UploadResponse {
  url: string;
}

/**
 * Initialize S3 Client with credentials from environment variables
 */
const getS3Client = () => {
  const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
  const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
  const region = import.meta.env.VITE_AWS_REGION;

  if (!accessKeyId || !secretAccessKey || !region) {
    console.error('Missing AWS credentials:', {
      hasAccessKey: !!accessKeyId,
      hasSecretKey: !!secretAccessKey,
      hasRegion: !!region
    });
    throw new Error('AWS credentials are not configured. Please check your .env file and ensure variables are prefixed with VITE_');
  }

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
};

/**
 * Upload audio file directly to AWS S3
 * @param audioBlob - The audio file as a Blob
 * @param filename - The filename to use in S3
 * @returns Promise with the public URL of the uploaded file
 */
export const uploadAudioToS3 = async (audioBlob: Blob, filename: string): Promise<UploadResponse> => {
  try {
    const bucketName = import.meta.env.VITE_AWS_BUCKET_NAME || "bucketkuttan";
    const region = import.meta.env.VITE_AWS_REGION;

    if (!bucketName) {
      throw new Error('AWS bucket name is not configured. Please check your .env file.');
    }
    
    if (!region) {
      throw new Error('AWS region is not configured. Please check your .env file.');
    }

    // Convert Blob to ArrayBuffer
    const arrayBuffer = await audioBlob.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Create S3 client
    const s3Client = getS3Client();

    // Prepare the upload command
    const key = `recordings/${filename}`;
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: audioBlob.type || 'audio/mpeg',
      // Note: ACL removed - bucket must have public access configured via bucket policy instead
    });

    // Upload to S3
    await s3Client.send(command);

    // Construct the public URL
    const url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

    return { url };
  } catch (error) {
    console.error('Error uploading audio to S3:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to upload audio file: ${error.message}`);
    }
    throw new Error('Failed to upload audio file');
  }
};

/**
 * Generate a unique filename for the audio recording
 */
export const generateAudioFilename = (prefix: string = 'recording'): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${timestamp}_${random}.mp3`;
};

