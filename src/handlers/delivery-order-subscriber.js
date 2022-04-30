const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const AWS = require("aws-sdk");
AWS.config.region = process.env.AWS_REGION;
const docClient = new AWS.DynamoDB.DocumentClient();
const sns = new SNSClient(process.env.AWS_REGION);

const tableName = process.env.TABLE;
const topicARN = process.env.TOPIC;

const saveDeliveryOrder = (deliveryOrder) => {
  var params = {
    TableName: tableName,
    Item: deliveryOrder,
  };
  const result = docClient.put(params).promise();
  console.info(JSON.stringify(result));
  return result;
};

const publishMessage = (deliveryOrder) => {
  var params = {
    Message: JSON.stringify(deliveryOrder),
    TopicArn: topicARN,
  };
  try {
    const data = sns.send(new PublishCommand(params));
    console.info("Success.", data);
    return data; // For unit tests.
  } catch (err) {
    console.log("Error", err.stack);
  }
};

const calculateDeliveryCost = (min, max) => {
  let result = Math.random() * (max - min) + min;
  return Math.round((result + Number.EPSILON) * 100) / 100;
};

// The Lambda handler
exports.deliveryOrderSubscriberHandler = async (event) => {
  try {
    for (let record of event.Records) {
      deliveryOrder = JSON.parse(record.body);
      deliveryOrder.id = record.messageId;
      deliveryOrder.deliveryCost = calculateDeliveryCost(2.5, 10);
      deliveryOrder.status = "READY_FOR_DELIVERY";
      console.info(JSON.stringify(deliveryOrder, 2, null));
      const result = await saveDeliveryOrder(deliveryOrder);
      const message = await publishMessage(deliveryOrder);
      console.info("sns:", message);
    }
  } catch (e) {
    console.error(e);
    throw e;
  }
};
