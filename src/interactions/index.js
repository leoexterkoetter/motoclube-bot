const { ephemeral } = require('../utils/responses');
const { handleSetButtonInteraction } = require('./buttons/set-buttons');
const { handleFarmButtonInteraction } = require('./buttons/farm-buttons');
const { handleSetModalSubmit } = require('./modals/set-modal');
const { handleFarmModalSubmit } = require('./modals/farm-modal');

async function handleComponentInteraction(interaction) {
  try {
    const customId = interaction.data.custom_id;

    if (customId.startsWith('set_')) {
      return await handleSetButtonInteraction(interaction);
    }

    if (customId.startsWith('farm_')) {
      return await handleFarmButtonInteraction(interaction);
    }

    return ephemeral('⚠️ Este botão ainda não foi implementado.');
  } catch (error) {
    console.error('ERRO EM handleComponentInteraction:', error);
    return ephemeral('❌ Erro ao processar botão. Verifique os logs da Vercel.');
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

    return ephemeral('⚠️ Este modal ainda não foi implementado.');
  } catch (error) {
    console.error('ERRO EM handleModalSubmit:', error);
    return ephemeral('❌ Erro ao processar formulário. Verifique os logs da Vercel.');
  }
}

module.exports = {
  handleComponentInteraction,
  handleModalSubmit,
};