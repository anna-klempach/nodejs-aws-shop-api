import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dotenv from 'dotenv';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
dotenv.config();

export class AuthorizationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const userName = process.env.USER_NAME!;

    new NodejsFunction(this, 'BasicAuthorizer', {
      functionName: 'basicAuthorizer',
      entry: 'src/lambda/basic-authorizer.ts',
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        USER_NAME: userName,
        [userName]: process.env[userName]!,
        REGION: process.env.REGION!
      }
    });
  }
}
