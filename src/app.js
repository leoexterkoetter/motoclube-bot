const { InteractionType } = require('discord-interactions');
const { handleCommand } = require('./commands');
const { handleComponentInteraction, handleModalSubmit } = require('./interactions');
const { ephemeral } = require('./utils/responses');
const { logError } = require('./utils/logger');

async function handleInteraction(interaction) {
  try {
    if (interaction.type === InteractionType.APPLICATION_COMMAND) {
      return await handleCommand(interaction);
    }

    if (interaction.type === InteractionType.MESSAGE_COMPONENT) {
      return await handleComponentInteraction(interaction);
    }

    if (interaction.type === InteractionType.MODAL_SUBMIT) {
      return await handleModalSubmit(interaction);
    }

    return ephemeral('❌ Tipo de interação não suportado.');
  } catch (error) {
    logError('Erro em handleInteraction', error);
    return ephemeral('❌ Erro interno. Verifique os logs da Vercel.');
  }
}

module.exports = {
  handleInteraction,
};