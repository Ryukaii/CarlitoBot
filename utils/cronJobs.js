const schedule = require("node-schedule");

/**
 * Função utilitária para enviar mensagens automáticas via cron.
 *
 * @param {string} cronExpression - A expressão cron para agendar a mensagem.
 * @param {string} message - A mensagem a ser enviada.
 * @param {boolean} sendToAllGroups - Define se a mensagem será enviada para todos os grupos.
 * @param {Array} specificIds - Lista de IDs específicos (obrigatório se sendToAllGroups for false).
 * @param {object} client - O cliente (por exemplo, WhatsApp) que será usado para envio.
 */
async function scheduleMessage(
  cronExpression,
  message,
  sendToAllGroups,
  specificIds,
  client,
) {
  if (!sendToAllGroups && (!specificIds || specificIds.length === 0)) {
    throw new Error(
      "Se 'sendToAllGroups' for false, é necessário fornecer 'specificIds'.",
    );
  }

  schedule.scheduleJob(cronExpression, async () => {
    console.log(`Enviando mensagem agendada: "${message}"`);

    const chats = await client.getChats();
    const groups = chats.filter((chat) => chat.id.server === "g.us");
    const privateChats = chats.filter((chat) => chat.id.server !== "g.us");

    let targets = [];

    if (sendToAllGroups) {
      targets = groups;
      console.log(
        `Mensagem será enviada para todos os ${groups.length} grupos.`,
      );
    } else {
      targets = chats.filter((chat) =>
        specificIds.includes(chat.id._serialized),
      );
      console.log(
        `Mensagem será enviada para IDs específicos: ${specificIds.join(", ")}`,
      );
    }

    for (const target of targets) {
      try {
        await client.sendMessage(target.id._serialized, message);
        console.log(
          `Mensagem enviada para: ${target.name} - ID: ${target.id._serialized}`,
        );
      } catch (err) {
        console.error(
          `Erro ao enviar mensagem para: ${target.name || target.id._serialized}`,
          err,
        );
      }
    }
  });
}

module.exports = { scheduleMessage };
