import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({ region: process.env.CDK_DEFAULT_REGION });
export default {
  importFile: async (fileName: string) => {
    try {
      const command = new PutObjectCommand({ Bucket: process.env.UPLOAD_BUCKET_NAME, Key: `uploaded/${fileName}`, ContentType: 'text/csv' });
      return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    }
    catch (e) {
      throw (e);
    }
  }
}