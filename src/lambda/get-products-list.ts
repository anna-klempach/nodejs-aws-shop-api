import ProductsService from '../products-service';
import { buildResponse } from '../utils';
export const handler = async () => {
  try {
    const products = await ProductsService.getProducts();
    return buildResponse(200, products);
  }
  catch ({ error, message }: any) {
    return buildResponse(error || 404, { message: message || 'Unable to get products list.' });
  }
};