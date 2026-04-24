const { isStaff } = require('../utils/permissions');
const { ephemeral } = require('../utils/responses');
const { sendChannelMessage } = require('../services/channels');
const { buildSetPanelEmbed, buildSetPanelComponents } = require('../utils/embeds');
const { logSuccess } = require('../utils/logger');

async function handlePainelSetCommand(interaction) {
  if (!isStaff(interaction)) {
    return ephemeral('❌ Você não possui permissão para usar este comando.');
  }

  if (!process.env.CANAL_SOLICITAR_SET) {
    return ephemeral('❌ CANAL_SOLICITAR_SET não configurado na Vercel.');
  }

  await sendChannelMessage(process.env.CANAL_SOLICITAR_SET, {
    embeds: [buildSetPanelEmbed()],
    components: buildSetPanelComponents(),
  });

  logSuccess(`Painel de set enviado por ${interaction.member.user.username}`);
  return ephemeral('✅ Painel enviado com sucesso.');
}

module.exports = {
  handlePainelSetCommand,
};