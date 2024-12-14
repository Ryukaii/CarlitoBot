const { processMessage } = require("../services/bot-logic/bot");
const { sendWhatsAppMessage } = require("../services/z-api/handlers");
const AWS = require("aws-sdk");
require("dotenv").config();

AWS.config.update({
  region: process.env.AWS_REGION,
});

const sqs = new AWS.SQS();

async function receiveMessagesFromQueue() {
  const params = {
    QueueUrl: process.env.SQS_QUEUE_URL,
    MaxNumberOfMessages: 1,
    WaitTimeSeconds: 20,
  };

  try {
    const data = await sqs.receiveMessage(params).promise();
    if (data.Messages) {
      for (const message of data.Messages) {
        const event = JSON.parse(message.Body);
        console.log("Mensagem recebida da fila:", event);

        try {
          const response = await processMessage(event);
          const recipient = event.isGroup ? event.groupId : event.from;

          await sendWhatsAppMessage(recipient, response);
          console.log(`Resposta enviada para ${event.from}: ${response}`);

          await sqs
            .deleteMessage({
              QueueUrl: process.env.SQS_QUEUE_URL,
              ReceiptHandle: message.ReceiptHandle,
            })
            .promise();
          console.log("Mensagem removida da fila.");
        } catch (error) {
          console.error("Erro ao processar ou enviar mensagem:", error);
        }
      }
    } else {
      console.log("Nenhuma mensagem disponível na fila.");
    }
  } catch (error) {
    console.error("Erro ao consumir mensagens do SQS:", error);
  }
}

module.exports = { receiveMessagesFromQueue };
