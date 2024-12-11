const Groq = require("groq-sdk");
const { getLastMessages, saveMessage } = require("../../utils/redisClient");
require("dotenv").config();
const fs = require("fs");
//consome o arquivo system_prompt.txt
const systemacuti = fs.readFileSync("system_prompt.txt", "utf8");

const { client } = require("../../services/whatsapp-client/client");
const { scheduleMessage } = require("../../utils/cronJobs");

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

    console.log(messages);

    // Envia a mensagem para o Groq
    const response = await groq.chat.completions.create({
      model: process.env.MODEL,
      messages,
      max_tokens: 500,
      temperature: 0.8,
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

scheduleMessage(
  "0 12 * * *",
  "📿 É hora do Angelus! Vamos rezar juntos: \n\nO Anjo do Senhor anunciou a Maria...",
  true,
  [],
  client,
);

scheduleMessage(
  "0 7 * * 5",
  ` 📿 Bom dia! Hoje é sexta-feira, um dia especial para nos lembrarmos do amor de Cristo. \n\nVamos começar o dia com uma intenção especial: *abstinência de carne*, um pequeno gesto de amor e sacrifício. \n"Nem só de pão viverá o homem, mas de toda palavra que procede da boca de Deus." (Mt 4,4) \n\nQue o amor de Deus nos guie e nos fortaleça hoje! 🙏
`,
  true,
  [],
  client,
);

scheduleMessage(
  "0 12 * * 5",
  ` 📿 Boa tarde! No meio do dia, vamos nos lembrar de que a *abstinência de carne* é um ato de amor e renúncia. \n\nVamos oferecer nossos sacrifícios com amor e esperança, sabendo que Deus está conosco em todos os momentos. \n"O Senhor é minha luz e minha salvação: de quem terei medo?" (Sl 26,1) \n\nQue a presença de Deus nos ilumine e nos proteja! 🌟
`,
  true,
  [],
  client,
);

scheduleMessage(
  "0 18 * * 5",
  ` 📿 Boa noite! O dia está chegando ao fim, e vamos refletir sobre o que fizemos hoje. \n\nA *abstinência de carne* foi um gesto simples, mas valioso para nossa fé. Vamos agradecer a Deus por Seu amor infinito e por nos ter dado a oportunidade de nos aproximar Dele. \n"Se alguém quiser vir após mim, renuncie a si mesmo, tome a sua cruz e siga-me." (Mt 16,24) \n\nQue o amor de Deus nos guie e nos fortaleça em nossa jornada de fé! 🙏
`,
  true,
  [],
  client,
);

scheduleMessage(
  "45 9 * * *",
  "📿 Bom dia! Que Deus abençoe o seu dia e ilumine o seu caminho. 🙏",
  false,
  ["120363359894912599@g.us"],
  client,
);

module.exports = { processMessage };
