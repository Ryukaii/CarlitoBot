const express = require("express");
const webhook = require("./api/webhook");
const startWhatsAppService = require("./services/whatsapp-client");
const { receiveMessagesFromQueue } = require("./queues/queue-consumer");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/api", webhook);

// Inicializa o serviço WhatsApp e depois inicia o consumo de mensagens

(async () => {
  try {
    console.log(" > Inicializando Serviços");
    await startWhatsAppService();
    console.log(" > Serviço WhatsApp Inicializado");
    setInterval(receiveMessagesFromQueue, 5000);
  } catch (error) {
    console.error("Erro ao inicializar serviços:", error);
    process.exit(1);
  }
})();

app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));
