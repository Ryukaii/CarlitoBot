// handlers.js
const { handleIncomingMessage } = require("../message-handler/handler");

let globalClient = null; // Variável para armazenar o cliente

function setupHandlers(client) {
  console.log("Configurando handlers...");
  globalClient = client;
  // Evento para mensagens recebidas
  client.on("message", async (message) => {
    try {
      // Enfileira a mensagem ou executa lógica necessária
      //console.log(message);
      await handleIncomingMessage(message);
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
    }
  });

  // Evento para desconexão
  client.on("disconnected", (reason) => {
    console.log("WhatsApp desconectado:", reason);
  });

  console.log("Handlers configurados.");
}

async function sendWhatsAppMessage(from, response) {
  if (!globalClient) {
    throw new Error("O cliente não está inicializado.");
  }
  try {
    await globalClient.sendMessage(from, response);
    console.log(`Mensagem enviada para ${from}: ${response}`);
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
  }
}

module.exports = { setupHandlers, sendWhatsAppMessage };
