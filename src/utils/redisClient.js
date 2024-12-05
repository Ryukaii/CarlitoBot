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

module.exports = redisClient;
