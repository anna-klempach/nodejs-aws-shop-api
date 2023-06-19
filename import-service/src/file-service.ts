import { S3Client, PutObjectCommand, GetObjectCommand, GetObjectCommandOutput } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3EventRecord } from 'aws-lambda';
const csv = require('csv-parser');
import { Readable } from 'stream';

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
  },
  parseFile: async (records: S3EventRecord[]) => {
    try {
      const parsePromises = records.map(async (rec) => {
        const { s3: {
          bucket: s3Bucket,
          object: {
            key: currObjectKey
          }
        } } = rec;
        if (!currObjectKey.includes('uploaded')) {
          return Promise.resolve();
        }

        const getObjectCommand = new GetObjectCommand({ Bucket: s3Bucket.name, Key: currObjectKey });

        const response = await s3Client.send(getObjectCommand);
        const readStream = response.Body as Readable;
        const results: Array<any> = [];
        await new Promise<void>((resolve, reject) => {
          readStream.pipe(csv({
            mapValues: ({ header, value }: any) => {
              if (header === 'price' || header === 'count') {
                return parseInt(value, 10);
              }
              return value;
            }
          }))
            .on('data', (data: any) => {
              results.push(data);
              resolve();
            })
            .on('end', () => {
              results.forEach((res) => {
                console.log(`Parsed file: ${JSON.stringify(res)}`);
              })
            })
            .on('error', (error: Error) => {
              reject(error);
            });
        });
      });
      await Promise.all(parsePromises);
    }
    catch (e) {
      console.log('error', e)
      throw e;
    }
  }
}
