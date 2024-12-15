const axios = require("axios");

async function sendWhatsAppMessage(recipient, message) {
  const Z_API_INSTANCE = process.env.Z_API_INSTANCE;
  const Z_API_TOKEN = process.env.Z_API_TOKEN;
  const Z_API_CLIENT_TOKEN = process.env.Z_API_CLIENT_TOKEN;

  try {
    const response = await axios.post(
      `https://api.z-api.io/instances/${Z_API_INSTANCE}/token/${Z_API_TOKEN}/send-text`,
      {
        phone: recipient,
        message: message,
      },
      {
        headers: {
          "Client-Token": Z_API_CLIENT_TOKEN,
          "Content-Type": "application/json",
        },
      },
    );
    console.log(`Mensagem enviada para ${recipient}: ${message}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    throw error;
  }
}

module.exports = { sendWhatsAppMessage };
