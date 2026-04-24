const { InteractionResponseType } = require('discord-interactions');
const { modal, ephemeral } = require('../../utils/responses');
const { isStaff } = require('../../utils/permissions');
const { getChannel, deleteChannel } = require('../../services/channels');
const { parseFarmState, resetFarmState } = require('../../utils/farm-state');
const { updateFarm, logFarm } = require('../../utils/farm-actions');
const { logSuccess, logError } = require('../../utils/logger');

async function getFarmStateFromChannel(channelId) {
  const channel = await getChannel(channelId);
  return parseFarmState(channel?.topic || '');
}

function buildDeliveryModal() {
  return modal({
    custom_id: 'farm_modal_register_delivery',
    title: 'Registrar entrega',
    components: [
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: 'valor_entregue',
            label: 'Valor entregue',
            style: 1,
            required: true,
            max_length: 20,
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: 'observacao_entrega',
            label: 'Observação',
            style: 2,
            required: false,
            max_length: 200,
          },
        ],
      },
    ],
  });
}

function buildGoalModal() {
  return modal({
    custom_id: 'farm_modal_update_goal',
    title: 'Atualizar meta',
    components: [
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: 'nova_meta',
            label: 'Nova meta semanal',
            style: 1,
            required: true,
            max_length: 20,
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: 'motivo_meta',
            label: 'Motivo da alteração',
            style: 2,
            required: false,
            max_length: 200,
          },
        ],
      },
    ],
  });
}

function buildNoteModal() {
  return modal({
    custom_id: 'farm_modal_add_note',
    title: 'Adicionar observação',
    components: [
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: 'observacao_texto',
            label: 'Observação',
            style: 2,
            required: true,
            max_length: 300,
          },
        ],
      },
    ],
  });
}

async function handleFarmButtonInteraction(interaction) {
  try {
    if (!isStaff(interaction)) {
      return ephemeral('❌ Você não possui permissão.');
    }

    const customId = interaction.data.custom_id;

    if (customId === 'farm_register_delivery') {
      return buildDeliveryModal();
    }

    if (customId === 'farm_update_goal') {
      return buildGoalModal();
    }

    if (customId === 'farm_add_note') {
      return buildNoteModal();
    }

    if (customId === 'farm_reset_week') {
  const state = await getFarmStateFromChannel(interaction.channel_id);

  if (!state.userId || !state.mainMessageId) {
    return ephemeral('❌ Dados da aba não encontrados.');
  }

  const nextState = resetFarmState({
    ...state,
    atualizadoEm: new Date().toISOString(),
  });

  await updateFarm(interaction.channel_id, nextState);

  const baseName = interaction.channel.name.replace(/^🟢-/, '').replace(/^🔴-/, '');

  await require('../../services/channels').editChannel(interaction.channel_id, {
    name: `🔴-${baseName}`,
  });

  await logFarm(
    interaction.channel_id,
    `♻️ Semana resetada por **${interaction.member.user.username}**.`
  );

  return ephemeral('♻️ Semana resetada com sucesso.');
}

    if (customId === 'farm_delete_channel') {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '⚠️ Tem certeza que deseja excluir esta aba?',
          flags: 64,
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 4,
                  custom_id: 'farm_confirm_delete_channel',
                  label: 'Confirmar exclusão',
                  emoji: { name: '🗑️' },
                },
              ],
            },
          ],
        },
      };
    }

    if (customId === 'farm_confirm_delete_channel') {
      await deleteChannel(interaction.channel_id);
      return {
        type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE,
      };
    }

    return ephemeral('⚠️ Ação de farm não reconhecida.');
  } catch (error) {
    logError('Erro em botão de farm', error);
    return ephemeral('❌ Erro ao processar ação de farm.');
  }
}

module.exports = {
  handleFarmButtonInteraction,
};