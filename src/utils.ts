import { AttributeValue, TransactGetItemsCommandInput } from '@aws-sdk/client-dynamodb';
import * as apigw from 'aws-cdk-lib/aws-apigateway';

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Headers': '*'
};

export function buildResponse<T>(statusCode: number, body: T) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body)
  }
}

export const CORS_PREFLIGHT_SETTINGS = {
  allowOrigins: ['*'],
  allowHeaders: ['*'],
  allowMethods: apigw.Cors.ALL_METHODS
};

export const PRODUCTS_SCAN_INPUT = {
  TableName: "products",
};

export const STOCKS_SCAN_INPUT = {
  TableName: "stocks",
};

export const getTransactItemInput = (productId: string): TransactGetItemsCommandInput => {
  return {
    TransactItems: [
      {
        Get: {
          TableName: process.env.PRODUCTS_TABLE_NAME,
          Key: {
            id: {
              S: productId,
            }
          }
        },
      },
      {
        Get: {
          TableName: process.env.STOCKS_TABLE_NAME,
          Key: {
            product_id: {
              S: productId,
            }
          }
        },
      },
    ]
  }
};

export const joinDataList = (productData: Array<Record<string, AttributeValue>>, stockData: Array<Record<string, AttributeValue>>) => {
  return productData.map((product) => {
    const productId = product.id.S;
    const matchingStock = stockData.find(
      (stock) => stock.product_id.S === productId
    );
    return joinData(product, matchingStock);
  });
};

export const joinData = (product: Record<string, AttributeValue>, stock?: Record<string, AttributeValue>) => ({
  id: product.id.S,
  title: product.title.S,
  description: product.description.S,
  price: Number(product.price.N),
  count: stock ? Number(stock.count.N) : 0,
});

