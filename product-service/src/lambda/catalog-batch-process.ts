import { errorHandler } from '../middleware/error-handler';
import { eventLogger } from '../middleware/event-logger';
import { SQSEvent } from 'aws-lambda';
import ProductsService from '../products-service';
const middy = require('@middy/core');

export const catalogBatchProcess = async (event: SQSEvent) => {
  try {
    ProductsService.catalogBatchProducts(event.Records);
  }
  catch ({ error, message }: any) {
    console.error(error, { message });
  }
};

export const handler = middy(catalogBatchProcess as any)
  .use(eventLogger())
  .use(errorHandler());