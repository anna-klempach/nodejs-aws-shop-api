import { SQSEvent } from 'aws-lambda';
import ProductsService from '../src/products-service';
import { CORS_HEADERS } from '../src/utils';
import { catalogBatchProcess } from '../src/lambda/catalog-batch-process';

const event: SQSEvent = {
  Records: [{
    messageId: 'Message 1',
    receiptHandle: 'Receipt handle 1',
    body: 'Body 1',
    attributes: {
      ApproximateReceiveCount: '',
      SentTimestamp: '',
      SenderId: '',
      ApproximateFirstReceiveTimestamp: ''
    },
    messageAttributes: {},
    md5OfBody: '',
    eventSource: '',
    eventSourceARN: '',
    awsRegion: ''
  },
  {
    messageId: 'Message 2',
    receiptHandle: 'Receipt handle 2',
    body: 'Body 2',
    attributes: {
      ApproximateReceiveCount: '',
      SentTimestamp: '',
      SenderId: '',
      ApproximateFirstReceiveTimestamp: ''
    },
    messageAttributes: {},
    md5OfBody: '',
    eventSource: '',
    eventSourceARN: '',
    awsRegion: ''
  }]
};

describe('catalogBatchProcess', () => {
  it('should return a 200 response with the success message containing the number of created products if Products Service catalogBatchProducts succeeds', async () => {
    jest.spyOn(ProductsService, 'catalogBatchProducts').mockResolvedValueOnce();
    const expectedResult = {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify('2 products successfully added to catalog.')
    };
    const result = await catalogBatchProcess(event);
    expect(result).toEqual(expectedResult);
  });

  it('should return a failure response if Products Service throws an error', async () => {
    const serviceError = { error: 404, message: 'Unable to write data to database' };
    jest.spyOn(ProductsService, 'catalogBatchProducts').mockRejectedValueOnce(serviceError);
    const expectedResult = {
      statusCode: serviceError.error,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: serviceError.message })
    };
    const result = await catalogBatchProcess(event);
    expect(result).toEqual(expectedResult);
  });
});
