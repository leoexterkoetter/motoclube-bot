const { InteractionResponseType } = require('discord-interactions');
const { handleSetButtonInteraction } = require('./buttons/set-buttons');
const { handleFarmButtonInteraction } = require('./buttons/farm-buttons');
const { handleSetModalSubmit } = require('./modals/set-modal');
const { handleFarmModalSubmit } = require('./modals/farm-modal');

async function handleComponentInteraction(interaction) {
  const customId = interaction.data.custom_id;

  if (customId.startsWith('set_')) {
    return handleSetButtonInteraction(interaction);
  }

  if (customId.startsWith('farm_')) {
    return handleFarmButtonInteraction(interaction);
  }

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: '⚠️ Este botão ainda não foi implementado.',
      flags: 64,
    },
  };
}

async function handleModalSubmit(interaction) {
  const customId = interaction.data.custom_id;

  if (customId === 'set_submit_modal') {
    return handleSetModalSubmit(interaction);
  }

  if (customId.startsWith('farm_modal_')) {
    return handleFarmModalSubmit(interaction);
  }

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: '⚠️ Este modal ainda não foi implementado.',
      flags: 64,
    },
  };
}

module.exports = {
  handleComponentInteraction,
  handleModalSubmit,
};