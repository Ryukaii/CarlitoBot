const express = require("express");
const router = express.Router();
const sendMessageToQueue = require("../queues/queue-producer");

router.post("/", async (req, res) => {
  const { body } = req;
  console.log("Dados recebidos:", body);
  res.status(200).send("Processo iniciado com sucesso!");
});

router.post("/webhook", express.json(), async (req, res) => {
  // mostra o corpo da requisição
  console.log(req.body);
  try {
    const webhookData = req.body;

    if (webhookData.type === "ReceivedCallback" && !webhookData.fromMe) {
      const messageData = {
        from: webhookData.isGroup
          ? webhookData.participantPhone
          : webhookData.phone,
        body: webhookData.text.message,
        isGroup: webhookData.isGroup,
        groupId: webhookData.isGroup ? webhookData.phone : null,
        senderName: webhookData.senderName,
        messageId: webhookData.messageId,
      };
      console.log(messageData);
      if (messageData.body.toLowerCase().includes("@556181946042")) {
        const userMessage = messageData.body
          .replace("@556181946042", "")
          .trim();
        const event = {
          from: messageData.from,
          body: `${messageData.senderName}: ${userMessage}`,
          isGroup: messageData.isGroup,
          groupId: messageData.groupId,
          messageId: messageData.messageId,
        };

        await sendMessageToQueue(event);
        console.log("Mensagem enfileirada com sucesso!");
      }
    }

    res.status(200).send("Evento processado com sucesso");
  } catch (error) {
    console.error("Erro detalhado:", error);
    res.status(500).send("Erro ao processar evento");
  }
});

module.exports = router;
