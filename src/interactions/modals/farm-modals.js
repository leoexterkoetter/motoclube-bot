const { ephemeral } = require('../../utils/responses');
const {
  parseFarmState,
  calculateFarmProgress,
  formatCurrency,
} = require('../../utils/farm-state');
const {
  updateFarmMainMessage,
  updateFarmChannelTopic,
  postFarmLog,
} = require('../../utils/farm-actions');
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

async function handleFarmModalSubmit(interaction) {
  const state = parseFarmState(interaction.channel?.topic || '');

  if (!state.userId) {
    return ephemeral('❌ Não foi possível localizar os dados da aba.');
  }

  const customId = interaction.data.custom_id;

  if (customId === 'farm_modal_register_delivery') {
    const valor = Number(String(getModalValue(interaction, 'valor_entregue')).replace(/[^0-9]/g, ''));
    const observacao = getModalValue(interaction, 'observacao_entrega') || 'Sem observação.';

    if (!valor) {
      return ephemeral('❌ Informe um valor válido para a entrega.');
    }

    const nextState = calculateFarmProgress({
      ...state,
      totalEntregue: Number(state.totalEntregue || 0) + valor,
      atualizadoEm: new Date().toISOString(),
    });

    await updateFarmChannelTopic(interaction.channel_id, nextState);
    await updateFarmMainMessage(interaction.channel_id, nextState);
    await postFarmLog(
      interaction.channel_id,
      `✅ Entrega registrada por **${interaction.member.user.username}** — Valor: **${formatCurrency(valor)}** — Observação: ${observacao}`
    );

    logSuccess(`Entrega registrada por ${interaction.member.user.username}`);
    return ephemeral('✅ Entrega registrada com sucesso.');
  }

  if (customId === 'farm_modal_update_goal') {
    const novaMeta = Number(String(getModalValue(interaction, 'nova_meta')).replace(/[^0-9]/g, ''));
    const motivo = getModalValue(interaction, 'motivo_meta') || 'Sem motivo informado.';

    if (!novaMeta) {
      return ephemeral('❌ Informe uma meta válida.');
    }

    const nextState = calculateFarmProgress({
      ...state,
      metaSemanal: novaMeta,
      atualizadoEm: new Date().toISOString(),
    });

    await updateFarmChannelTopic(interaction.channel_id, nextState);
    await updateFarmMainMessage(interaction.channel_id, nextState);
    await postFarmLog(
      interaction.channel_id,
      `💰 Meta atualizada por **${interaction.member.user.username}** — Nova meta: **${formatCurrency(novaMeta)}** — Motivo: ${motivo}`
    );

    return ephemeral('💰 Meta atualizada com sucesso.');
  }

  if (customId === 'farm_modal_add_note') {
    const observacao = getModalValue(interaction, 'observacao_texto');

    const nextState = {
      ...state,
      observacao: observacao || 'Sem observações.',
      atualizadoEm: new Date().toISOString(),
    };

    await updateFarmChannelTopic(interaction.channel_id, nextState);
    await updateFarmMainMessage(interaction.channel_id, nextState);
    await postFarmLog(
      interaction.channel_id,
      `📝 Observação atualizada por **${interaction.member.user.username}** — ${observacao}`
    );

    return ephemeral('📝 Observação atualizada com sucesso.');
  }

  return ephemeral('⚠️ Modal de farm não reconhecido.');
}

module.exports = {
  handleFarmModalSubmit,
};