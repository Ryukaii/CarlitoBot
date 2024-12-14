const express = require("express");
const webhookRouter = require("./api/webhook");
const { receiveMessagesFromQueue } = require("./queues/queue-consumer");
require("dotenv").config();
// carrega client para testar funcao

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/api", webhookRouter);

// Inicializa o serviço WhatsApp e depois inicia o consumo de mensagens

setInterval(receiveMessagesFromQueue, 5000);

app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));
