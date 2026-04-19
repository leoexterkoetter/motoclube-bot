require('dotenv').config();

const { discordRequest } = require('../src/services/discord-rest');
const { logInfo, logSuccess, logError } = require('../src/utils/logger');

const commands = [
  {
    name: 'painel-set',
    description: 'Envia o painel de solicitar set no canal configurado.',
  },
  {
    name: 'criarfarm',
    description: 'Cria uma aba privada de farm para um membro.',
    options: [
      {
        type: 6,
        name: 'membro',
        description: 'Membro que terá a aba de farm criada.',
        required: true,
      },
      {
        type: 3,
        name: 'id_cidade',
        description: 'ID da cidade do membro.',
        required: true,
      },
      {
        type: 4,
        name: 'meta_semanal',
        description: 'Meta semanal do membro.',
        required: true,
      },
      {
        type: 3,
        name: 'observacao',
        description: 'Observação inicial da aba.',
        required: false,
      }
    ]
  }
];

async function registerCommands() {
  try {
    logInfo('Registrando comandos do servidor...');

    await discordRequest(
      `/applications/${process.env.CLIENT_ID}/guilds/${process.env.GUILD_ID}/commands`,
      {
        method: 'PUT',
        body: JSON.stringify(commands),
      }
    );

    logSuccess('Comandos registrados com sucesso.');
  } catch (error) {
    logError('Falha ao registrar comandos.', error);
    process.exit(1);
  }
}

registerCommands();