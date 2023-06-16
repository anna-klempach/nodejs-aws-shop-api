#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ImportServiceStack } from '../lib/import-service-stack';
import * as dotenv from 'dotenv';
dotenv.config();

const app = new cdk.App();
new ImportServiceStack(app, 'ImportServiceStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }
});