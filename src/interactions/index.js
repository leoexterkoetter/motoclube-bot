const { ephemeral } = require('../utils/responses');
const { handleSetButtonInteraction } = require('./buttons/set-buttons');
const { handleSetModalSubmit } = require('./modals/set-modal');

async function handleComponentInteraction(interaction) {
  const customId = interaction.data.custom_id;

  if (customId.startsWith('set_')) {
    return handleSetButtonInteraction(interaction);
  }

  return ephemeral('⚠️ Este botão ainda não foi implementado.');
}

async function handleModalSubmit(interaction) {
  const customId = interaction.data.custom_id;

  if (customId === 'set_submit_modal') {
    return handleSetModalSubmit(interaction);
  }

  return ephemeral('⚠️ Este modal ainda não foi implementado.');
}

module.exports = {
  handleComponentInteraction,
  handleModalSubmit,
};