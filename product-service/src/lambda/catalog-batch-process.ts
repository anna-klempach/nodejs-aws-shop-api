import { errorHandler } from '../middleware/error-handler';
import { eventLogger } from '../middleware/event-logger';
import { SQSEvent } from 'aws-lambda';
import ProductsService from '../products-service';
import { buildResponse } from '../utils';
const middy = require('@middy/core');

export const catalogBatchProcess = async (event: SQSEvent) => {
  try {
    const records = event.Records;
    await ProductsService.catalogBatchProducts(records);
    return buildResponse(200, `${records.length} products successfully added to catalog.`);
  }
  catch ({ error, message }: any) {
    return buildResponse(error, { message });
  }
};

export const handler = middy(catalogBatchProcess as any)
  .use(eventLogger())
  .use(errorHandler());