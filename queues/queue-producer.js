const AWS = require("aws-sdk");
require("dotenv").config();

AWS.config.update({
  region: process.env.AWS_REGION,
});

const sqs = new AWS.SQS();

async function sendMessageToQueue(message) {
  const params = {
    QueueUrl: process.env.SQS_QUEUE_URL,
    MessageBody: JSON.stringify(message),
    MessageGroupId: "default-group", // Necessário para filas FIFO
  };

  try {
    const result = await sqs.sendMessage(params).promise();
    console.log("Mensagem enfileirada com sucesso:", result.MessageId);
  } catch (err) {
    console.error("Erro ao enfileirar mensagem:", err);
    throw err;
  }
}

module.exports = sendMessageToQueue;
