// services/whatsapp-client/index.js
const mongoose = require("mongoose");
const { client, clientReadyPromise } = require("./client");
const { setupHandlers } = require("./handlers");

// Conecta ao MongoDB e inicializa o cliente WhatsApp
async function startWhatsAppService() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(" > Conectado ao MongoDB.");

    client.initialize();

    await clientReadyPromise;

    console.log(
      " > Cliente WhatsApp inicializado e pronto para registrar eventos.",
    );

    setupHandlers(client);
    return client;
  } catch (err) {
    console.error("Erro ao iniciar o serviço WhatsApp:", err);
    throw err; // Propaga o erro para ser tratado no app.js
  }
}

module.exports = startWhatsAppService;
