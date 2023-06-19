import { S3Event } from 'aws-lambda';
import FileService from '../file-service';
import { buildResponse } from '../utils';
export const handler = async (event: S3Event) => {
  try {
    await FileService.parseFile(event.Records);
    return buildResponse(202, 'Records successfully parsed');
  }
  catch ({ error, message }: any) {
    return buildResponse(error, { message });
  }
};