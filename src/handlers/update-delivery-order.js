const AWS = require("aws-sdk");
AWS.config.region = process.env.AWS_REGION;
const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TABLE;

const updateDeliveryOrder = (deliveryOrder) => {
  var params = {
    TableName: tableName,
    Key: {
      id: deliveryOrder.id,
    },
    ProjectionExpression: "#status",
    ExpressionAttributeNames: { "#status": "status" },
    UpdateExpression: "set driver = :driver, #status = :status",
    ExpressionAttributeValues: {
      ":driver": deliveryOrder.driver,
      ":status": deliveryOrder.status,
    },
  };
  const result = docClient.update(params).promise();
  return result;
};

exports.putDeliveryOrderHandler = async (event) => {
  if (event.httpMethod !== "PUT") {
    throw new Error(
      `postMethod only accepts PUT method, you tried: ${event.httpMethod} method.`
    );
  }
  const deliveryOrder = JSON.parse(event.body);
  console.info("received:", deliveryOrder);
  const result = await updateDeliveryOrder(deliveryOrder);
  const response = {
    statusCode: 200,
    body: "successful",
  };
  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
  );
  return response;
};
