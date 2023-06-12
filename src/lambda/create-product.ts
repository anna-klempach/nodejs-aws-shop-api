import { errorHandler } from '../middleware/error-handler';
import { eventLogger } from '../middleware/event-logger';
import ProductsService from '../products-service';
import { productBaseSchema } from '../schemas';
import { buildResponse } from '../utils';
import middy from '@middy/core';

const createProductHandler = async (request: { body: string }) => {
  try {
    const product = JSON.parse(request.body);
    const { error } = productBaseSchema.validate(product);
    if (error) {
      throw { error: 400, message: error.details };
    }
    await ProductsService.createProduct(product);
    return buildResponse(200, 'Product successfully created');
  }
  catch ({ error, message }: any) {
    return buildResponse(error, { message });
  }
};

export const handler = middy(createProductHandler as any)
  .use(eventLogger())
  .use(errorHandler());