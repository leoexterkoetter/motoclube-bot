const { InteractionResponseType } = require('discord-interactions');
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
  const state = parseFarmState(interaction.channel.topic);
  const customId = interaction.data.custom_id;

  if (customId === 'farm_modal_register_delivery') {
    const valor = Number(String(getModalValue(interaction, 'valor_entregue')).replace(/[^0-9]/g, ''));
    const observacao = getModalValue(interaction, 'observacao_entrega') || 'Sem observação.';

    const totalEntregue = state.totalEntregue + valor;
    const nextState = calculateFarmProgress({
      ...state,
      totalEntregue,
      atualizadoEm: new Date().toISOString(),
    });

    await updateFarmChannelTopic(interaction.channel_id, nextState);
    await updateFarmMainMessage(interaction, nextState);
    await postFarmLog(
      interaction.channel_id,
      `✅ Entrega registrada por **${interaction.member.user.username}** — Valor: **${formatCurrency(valor)}** — Observação: ${observacao}`
    );

    logSuccess(`Entrega registrada por ${interaction.member.user.username}`);

    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: '✅ Entrega registrada com sucesso.',
        flags: 64,
      },
    };
  }

  if (customId === 'farm_modal_update_goal') {
    const novaMeta = Number(String(getModalValue(interaction, 'nova_meta')).replace(/[^0-9]/g, ''));
    const motivo = getModalValue(interaction, 'motivo_meta') || 'Sem motivo informado.';

    const nextState = calculateFarmProgress({
      ...state,
      metaSemanal: novaMeta,
      atualizadoEm: new Date().toISOString(),
    });

    await updateFarmChannelTopic(interaction.channel_id, nextState);
    await updateFarmMainMessage(interaction, nextState);
    await postFarmLog(
      interaction.channel_id,
      `💰 Meta atualizada por **${interaction.member.user.username}** — Nova meta: **${formatCurrency(novaMeta)}** — Motivo: ${motivo}`
    );

    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: '💰 Meta atualizada com sucesso.',
        flags: 64,
      },
    };
  }

  if (customId === 'farm_modal_add_note') {
    const observacao = getModalValue(interaction, 'observacao_texto');

    const nextState = {
      ...state,
      observacao,
      atualizadoEm: new Date().toISOString(),
    };

    await updateFarmChannelTopic(interaction.channel_id, nextState);
    await updateFarmMainMessage(interaction, nextState);
    await postFarmLog(
      interaction.channel_id,
      `📝 Observação atualizada por **${interaction.member.user.username}** — ${observacao}`
    );

    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: '📝 Observação atualizada com sucesso.',
        flags: 64,
      },
    };
  }

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: '⚠️ Modal de farm não reconhecido.',
      flags: 64,
    },
  };
}

module.exports = {
  handleFarmModalSubmit,
};