const { handlePainelSetCommand } = require('./painel-set');
const { handleCriarFarmCommand } = require('./criarfarm');
const { ephemeral } = require('../utils/responses');

async function handleCommand(interaction) {
  const commandName = interaction.data.name;

  switch (commandName) {
    case 'painel-set':
      return handlePainelSetCommand(interaction);

    case 'criarfarm':
      return handleCriarFarmCommand(interaction);

    default:
      return ephemeral('❌ Comando não reconhecido.');
  }
}

module.exports = {
  handleCommand,
};