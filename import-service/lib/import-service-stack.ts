import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dotenv from 'dotenv';

dotenv.config();


export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const bucket = s3.Bucket.fromBucketName(this, 'ImportBucket', process.env.UPLOAD_BUCKET_NAME!);
  }
}
