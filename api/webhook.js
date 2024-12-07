const express = require("express");
const router = express.Router();
const { queueMessage } = require("../queues/queue-producer");

router.post("/webhook", async (req, res) => {
  const { from, body } = req.body;

  try {
    await queueMessage("message.received", { from, body });
    res.status(200).send("Mensagem recebida e enfileirada.");
  } catch (err) {
    console.error("Erro ao processar webhook:", err);
    res.status(500).send("Erro interno.");
  }
});

module.exports = router;
