import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import {runTherb} from "./handler";

// Create an AWS resource (S3 Bucket)
//const bucket = new aws.s3.Bucket("therb-input");

// Export the name of the bucket
//export const bucketName = bucket.id;
const s3 = new aws.sdk.S3();
export const STACK = pulumi.getStack();

const bucket = new aws.s3.Bucket("therb-input", {
  bucket:`therb-input-${STACK}`
});

const lambdaRole = new aws.iam.Role("therb-lambda-role", {
  assumeRolePolicy: {
    Version: "2012-10-17",
    Statement: [
      {
        Action: "sts:AssumeRole",
        Principal: {
          Service: "lambda.amazonaws.com",
        },
        Effect: "Allow",
      }
    ]
  }
});

const lambdaS3Policy = new aws.iam.Policy("therb-lambda-s3-policy", {
  description: "IAM policy for Lambda to interact with S3",
  path: "/",
  policy: bucket.arn.apply(bucketArn => `{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": "s3:PutObject",
        "Resource": "${bucketArn}/*",
        "Effect": "Allow"
      }
  ]}`)
});

new aws.iam.RolePolicyAttachment("therb-lambda-s3-policy-attachment", {
  role: lambdaRole.name,
  policyArn: lambdaS3Policy.arn
})

const lambda = new aws.lambda.CallbackFunction("therb-run", {
  name: `therb-run-${STACK}`,
  runtime: aws.lambda.NodeJS12dXRuntime,
  role: lambdaRole,
  callback: runTherb,
  environment: {
    variables: {
      S3_BUCKET: bucket.id
    }
  }
})

const runTherbApi = new awsx.apigateway.API("therb-run", {
  routes: [
    {
      path: "/therb/run",
      method: "POST",
      eventHandler: lambda
    }
  ]
})

export const url = runTherbApi.url;

//所定のバケットにデータが格納されたら、ECSを実行する
bucket.onObjectCreated("therb-ecs-run", (event:aws.s3.BucketEvent) => {
  
  const AdmZip = require("adm-zip");
  if (event.Records?.length==0 || event.Records==undefined) {
    return void
  } 
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;

  const s3Object = await s3.getObject({
      Bucket: bucket,
      Key: key
  }).promise();

  //zipファイルをECSに渡す


  // if (s3Object.ContentType=='application/zip'){
  //   //const zip = new nodeZip(s3Object.Body, {base64: false, checkCRC32: true});
  //   const zip = new AdmZip(s3Object.Body);
  //   const zipEntries = zip.getEntries();

  //   zipEntries.forEach(function(zipEntry) {
  //     s3.putObject({
  //       Bucket: bucket,
  //       key: key,
  //       Body:new Buffer(zipEntries.asBinary, 'binary'),
  //       content_type: content_type
  //     })
  //   });
  // }
})

