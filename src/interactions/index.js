const { handleSetButtonInteraction } = require('./buttons/set-buttons');
const { handleFarmButtonInteraction } = require('./buttons/farm-buttons');
const { handleSetModalSubmit } = require('./modals/set-modal');
const { handleFarmModalSubmit } = require('./modals/farm-modal');
const { ephemeral } = require('../utils/responses');
const { logError } = require('../utils/logger');

async function handleComponentInteraction(interaction) {
  try {
    const customId = interaction.data.custom_id;

    if (customId.startsWith('set_')) {
      return await handleSetButtonInteraction(interaction);
    }

    if (customId.startsWith('farm_')) {
      return await handleFarmButtonInteraction(interaction);
    }

    return ephemeral('⚠️ Botão não reconhecido.');
  } catch (error) {
    logError('Erro em botão', error);
    return ephemeral('❌ Erro ao processar botão.');
  }
}

async function handleModalSubmit(interaction) {
  try {
    const customId = interaction.data.custom_id;

    if (customId === 'set_submit_modal') {
      return await handleSetModalSubmit(interaction);
    }

    if (customId.startsWith('farm_modal_')) {
      return await handleFarmModalSubmit(interaction);
    }

    return ephemeral('⚠️ Modal não reconhecido.');
  } catch (error) {
    logError('Erro em modal', error);
    return ephemeral('❌ Erro ao processar formulário.');
  }
}

module.exports = {
  handleComponentInteraction,
  handleModalSubmit,
};