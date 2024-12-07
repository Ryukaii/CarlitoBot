const redis = require("redis");
const dotenv = require("dotenv");

dotenv.config();

const redisClient = redis.createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: 14006, // Certifique-se de ajustar conforme necessário
  },
});

redisClient.on("error", (err) => {
  console.error("Erro ao conectar no Redis:", err);
});

(async () => {
  try {
    await redisClient.connect();
    console.log("Conectado ao Redis!");
  } catch (error) {
    console.error("Erro ao conectar no Redis:", error);
  }
})();

async function getLastMessages(chatId, limit = 5) {
  const redisKey = `context:${chatId}`;
  try {
    // Recupera as últimas 'limit' mensagens
    const storedMessages = await redisClient.lRange(redisKey, -limit, -1);
    return storedMessages.map((msg) => JSON.parse(msg)); // Converte para objetos JSON
  } catch (error) {
    console.error("Erro ao recuperar as últimas mensagens do Redis:", error);
    return [];
  }
}

async function saveMessage(chatId, message) {
  const redisKey = `context:${chatId}`;
  try {
    await redisClient.rPush(redisKey, JSON.stringify(message)); // Adiciona mensagem no Redis
    await redisClient.expire(redisKey, 24 * 60 * 60); // Expiração de 24 horas
  } catch (error) {
    console.error("Erro ao salvar mensagem no Redis:", error);
  }
}

module.exports = { redisClient, getLastMessages, saveMessage };
