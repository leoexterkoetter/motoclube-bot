const {
  MessageComponentTypes,
  ButtonStyleTypes,
} = require('discord-interactions');
const { isStaff } = require('../utils/permissions');
const { ephemeral } = require('../utils/responses');
const { buildSetPanelEmbed } = require('../utils/embeds');
const { sendChannelMessage } = require('../services/channels');
const { logSuccess } = require('../utils/logger');

async function handlePainelSetCommand(interaction) {
  if (!isStaff(interaction)) {
    return ephemeral('❌ Você não possui permissão para usar este comando.');
  }

  const channelId = process.env.CANAL_SOLICITAR_SET;

  if (!channelId) {
    return ephemeral('❌ A variável CANAL_SOLICITAR_SET não está configurada.');
  }

  await sendChannelMessage(channelId, {
    embeds: [buildSetPanelEmbed()],
    components: [
      {
        type: 1,
        components: [
          {
            type: MessageComponentTypes.BUTTON,
            style: ButtonStyleTypes.PRIMARY,
            custom_id: 'set_open_modal',
            label: 'Solicitar Set',
            emoji: {
              name: '📝',
            },
          },
        ],
      },
    ],
  });

  logSuccess('Painel enviado');
  return ephemeral('✅ Painel enviado com sucesso.');
}

module.exports = {
  handlePainelSetCommand,
};