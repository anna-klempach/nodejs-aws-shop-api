import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dotenv from 'dotenv';
import * as s3notifocations from 'aws-cdk-lib/aws-s3-notifications';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { CORS_PREFLIGHT_SETTINGS } from '../src/utils';
import { ErrorSchema } from '../src/models';

dotenv.config();

const COMMON_LAMBDA_PROPS: Partial<NodejsFunctionProps> = {
  runtime: lambda.Runtime.NODEJS_18_X,
  timeout: cdk.Duration.seconds(300),
  environment: {
    CDK_DEFAULT_REGION: process.env.CDK_DEFAULT_REGION!,
    UPLOAD_BUCKET_NAME: process.env.UPLOAD_BUCKET_NAME!
  }
};
export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const bucket = s3.Bucket.fromBucketName(this, 'ImportBucket', process.env.UPLOAD_BUCKET_NAME!);

    const importProductsFile = new NodejsFunction(this, 'ImportProductsFileHandler', {
      functionName: 'importProductsFile',
      entry: 'src/lambda/import-products-file.ts',
      ...COMMON_LAMBDA_PROPS
    });

    bucket.grantReadWrite(importProductsFile);

    const api = new apigw.RestApi(this, 'import-api', {
      restApiName: "Import Service",
      description: "This service imports files."
    });

    const importProductsFileIntegration = new apigw.LambdaIntegration(importProductsFile);

    const importApi = api.root.addResource('import');
    const errorModel = api.addModel('ErrorModel', {
      modelName: 'ErrorModel',
      schema: ErrorSchema
    });

    const signedUrlModel = api.addModel('SignedUrlModel', {
      modelName: 'ProductModel',
      schema: { type: apigw.JsonSchemaType.STRING }
    });

    importApi.addCorsPreflight(CORS_PREFLIGHT_SETTINGS);

    const importFileValidator = api.addRequestValidator('ImportFileRequestValidator', {
      validateRequestParameters: true,
      validateRequestBody: false,
    });

    importApi.addMethod('GET', importProductsFileIntegration, {
      requestParameters: {
        'method.request.querystring.name': true
      },
      requestValidator: importFileValidator,
      methodResponses: [
        {
          statusCode: '200',
          responseModels: {
            'application/json': signedUrlModel
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

    const importFileParser = new NodejsFunction(this, 'ImportFileParserHandler', {
      functionName: 'importFileParser',
      entry: 'src/lambda/import-file-parser.ts',
      ...COMMON_LAMBDA_PROPS
    });

    bucket.grantRead(importFileParser);

    bucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3notifocations.LambdaDestination(importFileParser));
  }
}
