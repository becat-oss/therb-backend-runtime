import {STACK} from "./index";

export const runTherb = async (event: any, context: any) => {
  const AWS = require('aws-sdk');
  const s3 = new AWS.S3();

  //get file from payload
  const payloadBuffer = new Buffer(event.body, 'base64')
  const payload = payloadBuffer.toString('ascii')

  const putParams = {
    Bucket: process.env.S3_BUCKET,
    Key:`${new Date().getTime()}.json`, // We'll use the timestamp
    Body: payload
  }

  await new Promise((resolve, reject) => {
    s3.putObject(putParams, (err: any, data: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });

  return {
    statusCode:200,
    body:"Success"
  }
}