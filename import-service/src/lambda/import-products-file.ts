import FileService from '../file-service';
import { buildResponse } from '../utils';

export const handler = async (request: { queryStringParameters: { name: string } }) => {
  try {
    const { name } = request.queryStringParameters;
    if (!name.toLowerCase().endsWith('.csv')) {
      throw ({ error: 400, message: 'Invalid file format' });
    }
    const signedUrl = await FileService.importFile(name);
    return buildResponse(200, signedUrl);
  }
  catch ({ error, message }: any) {
    return buildResponse(error, { message });
  }
};