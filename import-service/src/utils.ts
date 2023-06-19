import * as apigw from 'aws-cdk-lib/aws-apigateway';
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

