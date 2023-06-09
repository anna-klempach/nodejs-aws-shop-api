import { S3Client, PutObjectCommand, GetObjectCommand, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { SQSClient, SendMessageBatchCommand } from '@aws-sdk/client-sqs';
import { S3EventRecord } from 'aws-lambda';
const csv = require('csv-parser');
import { Readable } from 'stream';

const s3Client = new S3Client({ region: process.env.CDK_DEFAULT_REGION });
const sqsClient = new SQSClient({ region: process.env.CDK_DEFAULT_REGION });
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
        if (!currObjectKey.includes(process.env.UPLOADED_FOLDER_NAME!)) {
          return Promise.resolve();
        }

        const getObjectCommand = new GetObjectCommand({ Bucket: s3Bucket.name, Key: currObjectKey });

        const response = await s3Client.send(getObjectCommand);
        const readStream = response.Body as Readable;
        const results: Array<string> = [];
        await new Promise<void>((resolve, reject) => {
          readStream.pipe(csv({
            mapValues: ({ header, value }: any) => {
              if (header === 'price' || header === 'count') {
                return parseInt(value, 10);
              }
              return value;
            }
          }))
            .on('data', async (data: any) => {
              results.push(JSON.stringify(data));
            })
            .on('end', async () => {
              try {
                await handleStreamEnd(results, s3Bucket.name, currObjectKey);
                resolve();
              }
              catch (e) {
                reject(e);
              }
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


const handleStreamEnd = async (results: string[], bucketName: string, currObjectKey: string) => {
  try {
    await sendRecordsToSqs(results);
    const copyObjectCommand = new CopyObjectCommand({
      Bucket: bucketName,
      CopySource: `${bucketName}/${currObjectKey}`,
      Key: currObjectKey.replace(process.env.UPLOADED_FOLDER_NAME!, process.env.PARSED_FOLDER_NAME!),
    });
    await s3Client.send(copyObjectCommand);

    const deleteObjectCommand = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: currObjectKey,
    });
    await s3Client.send(deleteObjectCommand);
  }
  catch (e) {
    throw (e);
  }
};

const sendRecordsToSqs = async (records: string[]) => {
  try {
    const entries = records.map((rec, i) => ({
      Id: `Message${i + 1}`,
      MessageBody: rec
    }));
    const command = new SendMessageBatchCommand({
      QueueUrl: process.env.QUEUE_URL!,
      Entries: entries
    });
    await sqsClient.send(command);
    console.log(`Messages were successfully sent`);
  } catch (error) {
    throw ({ message: "Error sending message to SQS:", error });
  }
};
