import { errorHandler } from '../middleware/error-handler';
import { eventLogger } from '../middleware/event-logger';
import ProductsService from '../products-service';
import { buildResponse } from '../utils';
const middy = require('@middy/core');

export const getProductsListHandler = async () => {
  try {
    const products = await ProductsService.getProducts();
    return buildResponse(200, products);
  }
  catch ({ error, message }: any) {
    return buildResponse(error || 404, { message: message || 'Unable to get products list.' });
  }
};

export const handler = middy(getProductsListHandler as any)
  .use(eventLogger())
  .use(errorHandler());