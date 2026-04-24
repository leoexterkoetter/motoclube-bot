const { ephemeral } = require('../../utils/responses');
const { getChannel } = require('../../services/channels');
const {
  parseFarmState,
  calculateFarmProgress,
} = require('../../utils/farm-state');
const { formatCurrency } = require('../../utils/embeds');
const { updateFarm, logFarm } = require('../../utils/farm-actions');
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

function parseMoney(value) {
  return Number(String(value || '').replace(/[^0-9]/g, ''));
}

async function getFarmState(channelId) {
  const channel = await getChannel(channelId);
  return parseFarmState(channel?.topic || '');
}

async function handleFarmModalSubmit(interaction) {
  try {
    const state = await getFarmState(interaction.channel_id);

    if (!state.userId || !state.mainMessageId) {
      return ephemeral('❌ Dados da aba de farm não encontrados.');
    }

    const customId = interaction.data.custom_id;

    if (customId === 'farm_modal_register_delivery') {
  const valor = parseMoney(getModalValue(interaction, 'valor_entregue'));
  const observacao =
    getModalValue(interaction, 'observacao_entrega') || 'Sem observação.';

  if (!valor) {
    return ephemeral('❌ Informe um valor válido.');
  }

  const nextState = calculateFarmProgress({
    ...state,
    totalEntregue: Number(state.totalEntregue || 0) + valor,
    atualizadoEm: new Date().toISOString(),
  });

  await updateFarm(interaction.channel_id, nextState);

  // ALTERA NOME DO CANAL
  const baseName = interaction.channel.name.replace(/^🟢-/, '').replace(/^🔴-/, '');

  if (nextState.status === 'Meta batida') {
    await require('../../services/channels').editChannel(interaction.channel_id, {
      name: `🟢-${baseName}`,
    });
  } else {
    await require('../../services/channels').editChannel(interaction.channel_id, {
      name: `🔴-${baseName}`,
    });
  }

  await logFarm(
    interaction.channel_id,
    `✅ Entrega registrada por **${interaction.member.user.username}** — Valor: **${formatCurrency(valor)}** — Observação: ${observacao}`
  );

  return ephemeral('✅ Entrega registrada com sucesso.');
}
    if (customId === 'farm_modal_update_goal') {
      const novaMeta = parseMoney(getModalValue(interaction, 'nova_meta'));
      const motivo = getModalValue(interaction, 'motivo_meta') || 'Sem motivo informado.';

      if (!novaMeta) {
        return ephemeral('❌ Informe uma meta válida.');
      }

      const nextState = calculateFarmProgress({
        ...state,
        metaSemanal: novaMeta,
        atualizadoEm: new Date().toISOString(),
      });

      await updateFarm(interaction.channel_id, nextState);
      await logFarm(
        interaction.channel_id,
        `💰 Meta atualizada por **${interaction.member.user.username}** — Nova meta: **${formatCurrency(novaMeta)}** — Motivo: ${motivo}`
      );

      logSuccess(`Meta atualizada por ${interaction.member.user.username}`);
      return ephemeral('💰 Meta atualizada com sucesso.');
    }

    if (customId === 'farm_modal_add_note') {
      const observacao = getModalValue(interaction, 'observacao_texto') || 'Sem observações.';

      const nextState = {
        ...state,
        observacao,
        atualizadoEm: new Date().toISOString(),
      };

      await updateFarm(interaction.channel_id, nextState);
      await logFarm(
        interaction.channel_id,
        `📝 Observação atualizada por **${interaction.member.user.username}** — ${observacao}`
      );

      logSuccess(`Observação atualizada por ${interaction.member.user.username}`);
      return ephemeral('📝 Observação atualizada com sucesso.');
    }

    return ephemeral('⚠️ Modal de farm não reconhecido.');
  } catch (error) {
    logError('Erro em modal de farm', error);
    return ephemeral('❌ Erro ao processar formulário de farm.');
  }
}

module.exports = {
  handleFarmModalSubmit,
};