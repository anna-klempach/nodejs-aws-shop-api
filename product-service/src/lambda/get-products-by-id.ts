import { errorHandler } from '../middleware/error-handler';
import { eventLogger } from '../middleware/event-logger';
import { GetProductsByIdEvent } from '../models';
import ProductsService from '../products-service';
import { buildResponse } from '../utils';
const middy = require('@middy/core');

export const getProductsByIdHandler = async (event: GetProductsByIdEvent) => {
  try {
    const { productId } = event.pathParameters;
    const product = await ProductsService.getProductById(productId);
    return buildResponse(200, product);
  }
  catch ({ error, message }: any) {
    return buildResponse(error, { message });
  }
};

export const handler = middy(getProductsByIdHandler as any)
  .use(eventLogger())
  .use(errorHandler());