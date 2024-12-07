const Groq = require("groq-sdk");
const { getLastMessages, saveMessage } = require("../../utils/redisClient");
require("dotenv").config();
const fs = require("fs");
//consome o arquivo system_prompt.txt
const systemacuti = fs.readFileSync("system_prompt.txt", "utf8");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function processMessage(event) {
  const { from, body } = event;

  try {
    // Recupera o contexto das últimas mensagens
    const context = await getLastMessages(from, 5);

    // Monta o contexto para enviar ao Groq
    const systemPrompt = {
      role: "system",
      content: systemacuti,
    };

    const messages = [
      systemPrompt,
      ...context,
      { role: "user", content: body },
    ];

    // Envia a mensagem para o Groq
    const response = await groq.chat.completions.create({
      model: process.env.MODEL,
      messages,
      max_tokens: process.env.MAXTOKENS,
      temperature: process.env.TEMPERATURE,
    });

    // Extrai a resposta
    const botResponse =
      response.choices[0]?.message?.content ||
      "Desculpe, não consegui responder.";

    // Salva o contexto no Redis
    await saveMessage(from, { role: "user", content: body });
    await saveMessage(from, { role: "assistant", content: botResponse });

    return botResponse;
  } catch (error) {
    console.error("Erro ao processar mensagem no Groq:", error);
    throw new Error("Não consegui processar sua mensagem.");
  }
}

module.exports = { processMessage };
