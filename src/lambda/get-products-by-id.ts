import { GetProductsByIdEvent } from '../models';
import ProductsService from '../products-service';
import { buildResponse } from '../utils';
export const handler = async (event: GetProductsByIdEvent) => {
  try {
    const { productId } = event.pathParameters;
    const product = await ProductsService.getProductById(productId);
    return buildResponse(200, product);
  }
  catch ({ error, message }: any) {
    return buildResponse(error, { message });
  }
};