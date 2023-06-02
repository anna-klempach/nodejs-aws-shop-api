import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { ErrorSchema, ProductListSchema, ProductSchema } from '../src/models';
import { CORS_PREFLIGHT_SETTINGS } from '../src/utils';


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

    const productModel = api.addModel('ProductModel', {
      modelName: 'ProductModel',
      schema: ProductSchema
    });

    const productListModel = api.addModel('ProductListModel', {
      modelName: 'ProductListModel',
      schema: ProductListSchema
    });

    const errorModel = api.addModel('ErrorModel', {
      modelName: 'ErrorModel',
      schema: ErrorSchema
    });

    const getProductsIntegration = new apigw.LambdaIntegration(getProductsList);
    const getProductsByIdIntegration = new apigw.LambdaIntegration(getProductsById);

    const productsApi = api.root.addResource('products');
    const productIdApi = productsApi.addResource('{productId}');

    productsApi.addCorsPreflight(CORS_PREFLIGHT_SETTINGS);
    productIdApi.addCorsPreflight(CORS_PREFLIGHT_SETTINGS);

    productsApi.addMethod('GET', getProductsIntegration, {
      methodResponses: [
        {
          statusCode: '200',
          responseModels: {
            'application/json': productListModel
          }
        },
        {
          statusCode: '404',
          responseModels: {
            'application/json': errorModel
          }
        }
      ]
    });

    productIdApi.addMethod('GET', getProductsByIdIntegration, {
      methodResponses: [
        {
          statusCode: '200',
          responseModels: {
            'application/json': productModel
          }
        },
        {
          statusCode: '404',
          responseModels: {
            'application/json': errorModel
          }
        }
      ]
    });
  }
}
