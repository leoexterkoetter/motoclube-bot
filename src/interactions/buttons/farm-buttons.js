const { InteractionResponseType } = require('discord-interactions');
const { isStaff } = require('../../utils/permissions');
const { ephemeral } = require('../../utils/responses');
const { deleteChannel } = require('../../services/channels');
const { parseFarmState, resetFarmWeekState } = require('../../utils/farm-state');
const {
  updateFarmChannelTopic,
  updateFarmMainMessage,
  postFarmLog,
} = require('../../utils/farm-actions');
const { logSuccess } = require('../../utils/logger');

async function handleFarmButtonInteraction(interaction) {
  if (!isStaff(interaction)) {
    return ephemeral('❌ Você não possui permissão.');
  }

  const customId = interaction.data.custom_id;

  if (customId === 'farm_register_delivery') {
    return {
      type: 9,
      data: {
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
      },
    };
  }

  if (customId === 'farm_update_goal') {
    return {
      type: 9,
      data: {
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
      },
    };
  }

  if (customId === 'farm_add_note') {
    return {
      type: 9,
      data: {
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
      },
    };
  }

  if (customId === 'farm_reset_week') {
    const state = parseFarmState(interaction.channel?.topic || '');

    if (!state.userId) {
      return ephemeral('❌ Não foi possível localizar os dados da aba.');
    }

    const nextState = resetFarmWeekState(state);

    await updateFarmChannelTopic(interaction.channel_id, nextState);
    await updateFarmMainMessage(interaction.channel_id, nextState);
    await postFarmLog(
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
    logSuccess(`Aba de farm excluída por ${interaction.member.user.username}`);
    await deleteChannel(interaction.channel_id);

    return {
      type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE,
    };
  }

  return ephemeral('⚠️ Ação de farm não reconhecida.');
}

module.exports = {
  handleFarmButtonInteraction,
};