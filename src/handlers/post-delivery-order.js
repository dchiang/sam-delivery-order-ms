const AWS = require("aws-sdk");
AWS.config.region = process.env.AWS_REGION;
const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });

exports.postDeliveryOrderHandler = async (event) => {
  if (event.httpMethod !== "POST") {
    throw new Error(
      `postMethod only accepts POST method, you tried: ${event.httpMethod} method.`
    );
  }
  const body = JSON.parse(event.body);
  console.info("received:", body);
  const params = {
    MessageBody: JSON.stringify(body),
    MessageGroupId: "delivery-order",
    QueueUrl: process.env.SQSqueueName,
  };
  // Send to SQS
  const result = await sqs.sendMessage(params).promise();
  const response = {
    statusCode: 200,
    body: JSON.stringify({ MessageId: result.MessageId }),
  };
  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
  );
  return response;
};
