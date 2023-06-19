import ProductsService from "../src/products-service";
import { getProductsListHandler } from "../src/lambda/get-products-list";
import { CORS_HEADERS } from "../src/utils";

const expectedProducts = [{
  "count": 5,
  "description": "A test product description.",
  "id": "test-product-id",
  "price": 249.99,
  "title": "Test Product Title"
},
{
  "count": 5,
  "description": "A second test product description.",
  "id": "test-product-id-2",
  "price": 199.99,
  "title": "Second Test Product Title"
}];

describe('getProductsList', () => {
  it('should return a 200 response with products list in the body if Products Service getProducts returns a list of products', async () => {
    jest.spyOn(ProductsService, 'getProducts').mockResolvedValueOnce(expectedProducts);
    const expectedResult = {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(expectedProducts)
    };
    const result = await getProductsListHandler();
    expect(result).toEqual(expectedResult);
  });

  it('should return a failure response with if Products Service getProducts throws an error with error status and message', async () => {
    const serviceError = { error: 500, message: 'Internal Server Error' };
    jest.spyOn(ProductsService, 'getProducts').mockRejectedValueOnce(serviceError);
    const expectedResult = {
      statusCode: serviceError.error,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: serviceError.message })
    };
    const result = await getProductsListHandler();
    expect(result).toEqual(expectedResult);
  });

  it('should return a default failure response with if Products Service getProducts throws an error with missing data', async () => {
    const serviceError = {};
    jest.spyOn(ProductsService, 'getProducts').mockRejectedValueOnce(serviceError);
    const expectedResult = {
      statusCode: 404,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'Unable to get products list.' })
    };
    const result = await getProductsListHandler();
    expect(result).toEqual(expectedResult);
  });
});