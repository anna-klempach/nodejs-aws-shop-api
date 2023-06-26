import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { ErrorSchema, ProductBaseSchema, ProductListSchema, ProductSchema } from '../src/models';
import { CORS_PREFLIGHT_SETTINGS } from '../src/utils';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dotenv from 'dotenv';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as sns from 'aws-cdk-lib/aws-sns';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

dotenv.config();

export class NodejsAwsShopApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const readPolicyStatement = new iam.PolicyStatement({
      actions: ['dynamodb:GetItem', 'dynamodb:Scan'],
      resources: [process.env.STOCKS_TABLE_ARN!, process.env.PRODUCTS_TABLE_ARN!],
    });

    const writePolicyStatement = new iam.PolicyStatement({
      actions: ['dynamodb:PutItem', 'dynamodb:UpdateItem', 'dynamodb:DeleteItem', 'dynamodb:BatchWriteItem'],
      resources: [process.env.STOCKS_TABLE_ARN!, process.env.PRODUCTS_TABLE_ARN!],
    });

    const COMMON_LAMBDA_PROPS: Partial<NodejsFunctionProps> = {
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.seconds(300),
      environment: {
        PRODUCTS_TABLE_NAME: process.env.PRODUCTS_TABLE_NAME!,
        STOCKS_TABLE_NAME: process.env.STOCKS_TABLE_NAME!,
        REGION: process.env.REGION!
      }
    }
    const getProductsList = new NodejsFunction(this, 'GetProductsListHandler', {
      functionName: 'getProductsList',
      entry: 'src/lambda/get-products-list.ts',
      ...COMMON_LAMBDA_PROPS
    });
    getProductsList.addToRolePolicy(readPolicyStatement);

    const getProductsById = new NodejsFunction(this, 'GetProductsByIdHandler', {
      functionName: 'getProductsById',
      entry: 'src/lambda/get-products-by-id.ts',
      ...COMMON_LAMBDA_PROPS
    });
    getProductsById.addToRolePolicy(readPolicyStatement);

    const createProduct = new NodejsFunction(this, 'CreateProductHandler', {
      functionName: 'createProduct',
      entry: 'src/lambda/create-product.ts',
      ...COMMON_LAMBDA_PROPS
    });

    createProduct.addToRolePolicy(writePolicyStatement);

    const catalogItemsQueue = new sqs.Queue(this, 'CatalogItemsQueue', {
      queueName: 'catalog-items-queue',
      visibilityTimeout: cdk.Duration.seconds(30)
    });

    const createProductTopic = new sns.Topic(this, 'CreateProductTopic', {
      topicName: 'create-product-topic'
    });

    const catalogBatchProcess = new NodejsFunction(this, 'CatalogBatchProcess', {
      functionName: 'catalogBatchProcess',
      entry: 'src/lambda/catalog-batch-process.ts',
      ...COMMON_LAMBDA_PROPS,
      environment: {
        ...COMMON_LAMBDA_PROPS.environment,
        CREATE_PRODUCT_TOPIC_ARN: createProductTopic.topicArn
      },
      timeout: cdk.Duration.seconds(30)
    });

    catalogBatchProcess.addToRolePolicy(writePolicyStatement);

    catalogBatchProcess.addEventSource(new SqsEventSource(catalogItemsQueue, {
      batchSize: 5
    }));

    createProductTopic.grantPublish(catalogBatchProcess);

    new sns.Subscription(this, 'EmailSubscription', {
      endpoint: process.env.EMAIL_ADDRESS!,
      protocol: sns.SubscriptionProtocol.EMAIL,
      topic: createProductTopic
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

    const productRequestModel = api.addModel('ProductBaseModel', {
      modelName: 'ProductBaseModel',
      schema: ProductBaseSchema
    });

    const errorModel = api.addModel('ErrorModel', {
      modelName: 'ErrorModel',
      schema: ErrorSchema
    });

    const getProductsIntegration = new apigw.LambdaIntegration(getProductsList);
    const getProductsByIdIntegration = new apigw.LambdaIntegration(getProductsById);
    const createProductIntegration = new apigw.LambdaIntegration(createProduct);

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

    const createProductsRequestValidator = api.addRequestValidator('CreateProductRequestValidator', {
      validateRequestParameters: false,
      validateRequestBody: true,
    });
    productsApi.addMethod('POST', createProductIntegration, {
      requestModels: {
        'application/json': productRequestModel
      },
      requestValidator: createProductsRequestValidator,
      methodResponses: [
        {
          statusCode: '200'
        },
        {
          statusCode: '404',
          responseModels: {
            'application/json': errorModel
          }
        }
      ]
    })

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
