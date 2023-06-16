import ProductsService from "../src/products-service";
import { handler } from "../src/lambda/get-products-by-id";
import { CORS_HEADERS } from "../src/utils";
import { GetProductsByIdEvent } from "../src/models";

const expectedProduct = {
  "count": 5,
  "description": "A test product description.",
  "id": "test-product-id",
  "price": 249.99,
  "title": "A Test Product Title"
};

const event: GetProductsByIdEvent = {
  pathParameters: {
    productId: 'test-product-id'
  }
};

describe('getProductsById', () => {
  it('should return a 200 response with product data in the body if Products Service returns an existing product', async () => {
    jest.spyOn(ProductsService, 'getProductById').mockResolvedValueOnce(expectedProduct);
    const expectedResult = {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(expectedProduct)
    };
    const result = await handler(event);
    expect(result).toEqual(expectedResult);
  });

  it('should return a failure response if Products Service throws an error', async () => {
    const serviceError = { error: 404, message: 'Product not found' };
    jest.spyOn(ProductsService, 'getProductById').mockRejectedValueOnce(serviceError);
    const expectedResult = {
      statusCode: serviceError.error,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: serviceError.message })
    };
    const result = await handler(event);
    expect(result).toEqual(expectedResult);
  });
});