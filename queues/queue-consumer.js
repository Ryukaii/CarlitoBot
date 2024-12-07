const { processMessage } = require("../services/bot-logic/bot");
const { sendWhatsAppMessage } = require("../services/whatsapp-client/handlers");
const AWS = require("aws-sdk");
require("dotenv").config();

AWS.config.update({
  region: process.env.AWS_REGION,
});

const sqs = new AWS.SQS();

async function receiveMessagesFromQueue() {
  const params = {
    QueueUrl: process.env.SQS_QUEUE_URL,
    MaxNumberOfMessages: 1, // Processa uma mensagem por vez
    WaitTimeSeconds: 20, // Long polling para reduzir custos
  };

  try {
    const data = await sqs.receiveMessage(params).promise();

    if (data.Messages) {
      for (const message of data.Messages) {
        const event = JSON.parse(message.Body);
        console.log("Mensagem recebida da fila:", event);

        try {
          // Processa a mensagem com a IA (Groq)
          const response = await processMessage(event);

          // Envia a resposta pelo WhatsApp
          await sendWhatsAppMessage(event.from, response);
          console.log(`Resposta enviada para ${event.from}: ${response}`);

          // Remove a mensagem da fila
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
