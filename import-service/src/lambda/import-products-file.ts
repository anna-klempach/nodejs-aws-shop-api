import ImportFileService from '../import-file-service';
import { buildResponse } from '../utils';

export const handler = async (request: { queryStringParameters: { name: string } }) => {
  try {
    const { name } = request.queryStringParameters;
    const signedUrl = await ImportFileService.importFile(name);
    return buildResponse(200, signedUrl);
  }
  catch ({ error, message }: any) {
    return buildResponse(error, { message });
  }
};