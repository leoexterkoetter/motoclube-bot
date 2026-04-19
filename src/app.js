const { InteractionType } = require('discord-interactions');
const { handleCommand } = require('./commands');
const { handleComponentInteraction, handleModalSubmit } = require('./interactions');
const { ephemeral } = require('./utils/responses');

async function handleInteraction(interaction) {
  switch (interaction.type) {
    case InteractionType.APPLICATION_COMMAND:
      return handleCommand(interaction);

    case InteractionType.MESSAGE_COMPONENT:
      return handleComponentInteraction(interaction);

    case InteractionType.MODAL_SUBMIT:
      return handleModalSubmit(interaction);

    default:
      return ephemeral('❌ Tipo de interação não suportado.');
  }
}

module.exports = {
  handleInteraction,
};