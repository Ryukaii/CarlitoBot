const sendMessageToQueue = require("../../queues/queue-producer");

async function handleIncomingMessage(message) {
  try {
    const { from, body } = message;
    const notifyName = message._data.notifyName;
    console.log(message);
    console.log(notifyName);
    console.log("Mensagem recebida:", { from, body });

    if (body.toLowerCase().includes("@556181946042")) {
      const userMessage = body.replace("@556181946042", "").trim();
      const event = {
        from,
        body: `${notifyName}: ${userMessage}`,
      };

      console.log("Mensagem mencionada recebida:", event);
      await sendMessageToQueue(event);
      console.log("Mensagem enfileirada com sucesso!");
    }
  } catch (error) {
    console.error("Erro ao processar mensagem mencionada:", error);
  }
}

module.exports = { handleIncomingMessage };
