const { handlePainelSetCommand } = require('./painel-set');
const { handleCriarFarmCommand } = require('./criarfarm');
const { ephemeral } = require('../utils/responses');

async function handleCommand(interaction) {
  const commandName = interaction.data.name;

  if (commandName === 'painel-set') {
    return handlePainelSetCommand(interaction);
  }

  if (commandName === 'criarfarm') {
    return handleCriarFarmCommand(interaction);
  }

  return ephemeral('❌ Comando não reconhecido.');
}

module.exports = {
  handleCommand,
};