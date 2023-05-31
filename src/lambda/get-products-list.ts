import ProductsService from '../products-service';
import { buildResponse } from '../utils';
export const handler = async () => {
  try {
    const products = await ProductsService.getProducts();
    return buildResponse(200, products);
  }
  catch (error) {
    return buildResponse(404, { message: 'Unable to send products list.' });
  }
};