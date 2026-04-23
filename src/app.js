const { InteractionType } = require('discord-interactions');
const { handleCommand } = require('./commands');
const { handleComponentInteraction, handleModalSubmit } = require('./interactions');
const { ephemeral } = require('./utils/responses');

async function handleInteraction(interaction) {
  try {
    switch (interaction.type) {
      case InteractionType.APPLICATION_COMMAND:
        return await handleCommand(interaction);

      case InteractionType.MESSAGE_COMPONENT:
        return await handleComponentInteraction(interaction);

      case InteractionType.MODAL_SUBMIT:
        return await handleModalSubmit(interaction);

      default:
        return ephemeral('❌ Tipo de interação não suportado.');
    }
  } catch (error) {
    console.error('ERRO EM handleInteraction:', error);
    return ephemeral('❌ Erro interno. Verifique os logs da Vercel.');
  }
}

module.exports = {
  handleInteraction,
};