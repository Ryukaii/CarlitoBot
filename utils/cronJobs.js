const schedule = require("node-schedule");
const axios = require("axios");

/**
 * Função utilitária para enviar mensagens automáticas via cron usando Z-API.
 *
 * @param {string} cronExpression - A expressão cron para agendar a mensagem.
 * @param {string} message - A mensagem a ser enviada.
 * @param {boolean} sendToAllGroups - Define se a mensagem será enviada para todos os grupos.
 * @param {Array} specificIds - Lista de IDs específicos (obrigatório se sendToAllGroups for false).
 */
async function scheduleMessage(
  cronExpression,
  message,
  sendToAllGroups,
  specificIds,
) {
  if (!sendToAllGroups && (!specificIds || specificIds.length === 0)) {
    throw new Error(
      "Se 'sendToAllGroups' for false, é necessário fornecer 'specificIds'.",
    );
  }

  schedule.scheduleJob(cronExpression, async () => {
    console.log(`Enviando mensagem agendada: "${message}"`);

    try {
      let targets = [];

      if (sendToAllGroups) {
        // Obter todos os grupos usando a Z-API
        const groupsResponse = await axios.get(
          `https://api.z-api.io/instances/${process.env.Z_API_INSTANCE}/token/${process.env.Z_API_TOKEN}/groups`,
        );
        targets = groupsResponse.data;
        console.log(
          `Mensagem será enviada para todos os ${targets.length} grupos.`,
        );
      } else {
        targets = specificIds.map((id) => ({ id }));
        console.log(
          `Mensagem será enviada para IDs específicos: ${specificIds.join(", ")}`,
        );
      }

      for (const target of targets) {
        try {
          await axios.post(
            `https://api.z-api.io/instances/${process.env.Z_API_INSTANCE}/token/${process.env.Z_API_TOKEN}/send-text`,
            {
              phone: target.id,
              message: message,
            },
            {
              headers: {
                "Client-Token": process.env.Z_API_CLIENT_TOKEN,
              },
            },
          );
          console.log(`Mensagem enviada para: ${target.id}`);
        } catch (err) {
          console.error(`Erro ao enviar mensagem para: ${target.id}`, err);
        }
      }
    } catch (error) {
      console.error("Erro ao obter grupos ou enviar mensagens:", error);
    }
  });
}

module.exports = { scheduleMessage };
