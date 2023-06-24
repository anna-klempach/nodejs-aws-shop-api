import FileService from '../src/file-service';
import { handler } from '../src/lambda/import-products-file';
import { CORS_HEADERS } from '../src/utils';

const MOCK_URL = 'https://some_mock_url';

const MOCK_REQUEST = {
  queryStringParameters: { name: 'fileName.csv' }
};

describe('importProductsFile', () => {
  it('should return a 200 response and a signed URL if the file name is valid and the URL is successfully created', async () => {
    jest.spyOn(FileService, 'importFile').mockResolvedValueOnce(MOCK_URL);
    const expectedResult = {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(MOCK_URL)
    };
    const result = await handler(MOCK_REQUEST);
    expect(result).toEqual(expectedResult);
  });

  it('should return a failure response if File Service getProducts throws an error with error status and message', async () => {
    const serviceError = { error: 500, message: 'Internal Server Error' };
    jest.spyOn(FileService, 'importFile').mockRejectedValueOnce(serviceError);
    const expectedResult = {
      statusCode: serviceError.error,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: serviceError.message })
    };
    const result = await handler(MOCK_REQUEST);
    expect(result).toEqual(expectedResult);
  });

  it('should return a failure response with code 400 and Invalid file format message if name does not have .csv format', async () => {
    const INVALID_MOCK_REQUEST = {
      queryStringParameters: { name: 'csv.txt' }
    };
    const expectedResult = {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'Invalid file format' })
    };
    const result = await handler(INVALID_MOCK_REQUEST);
    expect(result).toEqual(expectedResult);
  });
});