const { ephemeral } = require('../../utils/responses');
const { sendChannelMessage } = require('../../services/channels');
const {
  buildSetRequestEmbed,
  buildSetDecisionComponents,
} = require('../../utils/embeds');
const { serializeSetState } = require('../../utils/set-state');
const { logSuccess, logError } = require('../../utils/logger');

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
  try {
    const nomeRp = getModalValue(interaction, 'nome_rp');
    const idCidade = getModalValue(interaction, 'id_cidade');
    const telefone = getModalValue(interaction, 'telefone');
    const indicacao = getModalValue(interaction, 'indicacao');

    if (!nomeRp || !idCidade || !telefone || !indicacao) {
      return ephemeral('❌ Preencha todos os campos.');
    }

    if (!process.env.CANAL_SOLICITAR_SET) {
      return ephemeral('❌ CANAL_SOLICITAR_SET não configurado.');
    }

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

    state.footerText = serializeSetState(state);

    await sendChannelMessage(process.env.CANAL_SOLICITAR_SET, {
      embeds: [buildSetRequestEmbed(state)],
      components: buildSetDecisionComponents(false),
    });

    logSuccess(`Solicitação de set recebida: ${nomeRp} | ${idCidade}`);
    return ephemeral('✅ Cadastro enviado com sucesso.');
  } catch (error) {
    logError('Erro no modal de set', error);
    return ephemeral('❌ Erro ao enviar solicitação. Verifique os logs da Vercel.');
  }
}

module.exports = {
  handleSetModalSubmit,
};