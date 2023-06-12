import { DynamoDBClient, TransactGetItemsCommand, ScanCommand, TransactGetItemsCommandOutput } from "@aws-sdk/client-dynamodb";
import { PRODUCTS_SCAN_INPUT, STOCKS_SCAN_INPUT, getTransactItemInput, joinData, joinDataList } from './utils';
const client = new DynamoDBClient({ region: process.env.REGION });

export default {
  getProductById: async (id: string) => {
    try {
      const command = new TransactGetItemsCommand(getTransactItemInput(id));
      const response = await client.send(command);
      const [
        productResponse = {},
        stockResponse = {}
      ] = response.Responses || [];

      const productData = productResponse.Item;
      const stockData = stockResponse.Item;

      if (!productData) {
        throw ({ error: 404, message: 'Product not found' });
      }

      return joinData(productData, stockData);
    }
    catch (e) {
      throw e;
    }
  },
  getProducts: async () => {
    try {
      const productsScanCommand = new ScanCommand(PRODUCTS_SCAN_INPUT);
      const stocksScanCommand = new ScanCommand(STOCKS_SCAN_INPUT);

      const [productsResponse, stocksResponse] = await Promise.all([
        client.send(productsScanCommand),
        client.send(stocksScanCommand),
      ]);

      const productData = productsResponse.Items || [];
      const stockData = stocksResponse.Items || [];
      return joinDataList(productData, stockData);
    }
    catch (e) {
      throw e;
    }
  }
}