import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

declare const backend: lambda.Function;

export class NodejsAwsShopApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const getProductsList = new NodejsFunction(this, 'GetProductsListHandler', {
      functionName: 'getProductsList',
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: 'src/lambda/get-products-list.ts'
    });

    const getProductsById = new NodejsFunction(this, 'GetProductsByIdHandler', {
      functionName: 'getProductsById',
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: 'src/lambda/get-products-by-id.ts'
    });

    const api = new apigw.RestApi(this, 'products-api', {
      restApiName: "Products Service",
      description: "This service serves products."
    });

    const getProductsIntegration = new apigw.LambdaIntegration(getProductsList);
    const getProductsByIdIntegration = new apigw.LambdaIntegration(getProductsById);

    const productsApi = api.root.addResource('products');

    productsApi.addCorsPreflight({
      allowOrigins: ['*'],
      allowHeaders: ['*'],
      allowMethods: apigw.Cors.ALL_METHODS
    });

    productsApi.addMethod('GET', getProductsIntegration);

    const productIdApi = productsApi.addResource('{productId}');

    productIdApi.addCorsPreflight({
      allowOrigins: ['*'],
      allowHeaders: ['*'],
      allowMethods: apigw.Cors.ALL_METHODS
    });

    productIdApi.addMethod('GET', getProductsByIdIntegration);
  }
}
