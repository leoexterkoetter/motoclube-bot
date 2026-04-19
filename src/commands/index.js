const { InteractionResponseType } = require('discord-interactions');
const { handlePainelSetCommand } = require('./painel-set');
const { handleCriarFarmCommand } = require('./criarfarm');

async function handleCommand(interaction) {
  const commandName = interaction.data.name;

  switch (commandName) {
    case 'painel-set':
      return handlePainelSetCommand(interaction);

    case 'criarfarm':
      return handleCriarFarmCommand(interaction);

    default:
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '❌ Comando não reconhecido.',
          flags: 64,
        },
      };
  }
}

module.exports = {
  handleCommand,
};