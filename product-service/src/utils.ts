import { AttributeValue, TransactGetItemsCommandInput, TransactWriteItemsCommandInput } from '@aws-sdk/client-dynamodb';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { ProductBase } from './models';
const { v4: uuidv4 } = require('uuid');

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
  TableName: process.env.PRODUCTS_TABLE_NAME,
};

export const STOCKS_SCAN_INPUT = {
  TableName: process.env.STOCKS_TABLE_NAME,
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

export const getTransactWriteItemsInput = (value: ProductBase): TransactWriteItemsCommandInput => {
  const { count, description = '', price, title } = value;
  const uuid = uuidv4();
  return {
    TransactItems: [
      {
        Put: {
          TableName: process.env.PRODUCTS_TABLE_NAME,
          Item: {
            id: { S: uuid },
            title: { S: title },
            description: { S: description },
            price: { N: price.toString() },
          },
        },
      },
      {
        Put: {
          TableName: process.env.STOCKS_TABLE_NAME,
          Item: {
            product_id: { S: uuid },
            count: { N: count.toString() },
          },
        },
      },
    ],
  };
}

