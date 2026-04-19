const { ephemeral } = require('../../utils/responses');
const { sendChannelMessage } = require('../../services/channels');
const { buildSetRequestEmbed, buildSetDecisionComponents } = require('../../utils/embeds');
const { serializeSetState } = require('../../utils/set-state');
const { logSuccess } = require('../../utils/logger');

function getModalValue(interaction, customId) {
  for (const row of interaction.data.components || []) {
    for (const component of row.components || []) {
      if (component.custom_id === customId) {
        return component.value;
      }
    }
  }
  return '';
}

async function handleSetModalSubmit(interaction) {
  const nomeRp = getModalValue(interaction, 'nome_rp');
  const idCidade = getModalValue(interaction, 'id_cidade');
  const telefone = getModalValue(interaction, 'telefone');
  const indicacao = getModalValue(interaction, 'indicacao');

  const state = {
    userId: interaction.member.user.id,
    discordName: interaction.member.user.username,
    nomeRp,
    idCidade,
    telefone,
    indicacao,
    status: 'pending',
    statusText: '⏳ Aguardando análise da staff',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await sendChannelMessage(process.env.CANAL_SOLICITAR_SET, {
    embeds: [
      buildSetRequestEmbed({
        ...state,
        footerText: serializeSetState(state),
      }),
    ],
    components: buildSetDecisionComponents(),
  });

  logSuccess('Solicitação recebida');
  return ephemeral('✅ Cadastro enviado com sucesso.');
}

module.exports = {
  handleSetModalSubmit,
};