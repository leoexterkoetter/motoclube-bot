const {
  InteractionResponseType,
  TextInputStyleTypes,
} = require('discord-interactions');
const { isStaff } = require('../../utils/permissions');
const { deleteChannel } = require('../../services/channels');
const { parseFarmState, resetFarmWeekState } = require('../../utils/farm-state');
const { updateFarmMainMessage, updateFarmChannelTopic, postFarmLog } = require('../../utils/farm-actions');
const { logSuccess } = require('../../utils/logger');

async function handleFarmButtonInteraction(interaction) {
  if (!isStaff(interaction)) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: '❌ Você não possui permissão.',
        flags: 64,
      },
    };
  }

  const customId = interaction.data.custom_id;

  if (customId === 'farm_register_delivery') {
    return {
      type: InteractionResponseType.MODAL,
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
                style: TextInputStyleTypes.SHORT,
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
                style: TextInputStyleTypes.PARAGRAPH,
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
      type: InteractionResponseType.MODAL,
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
                style: TextInputStyleTypes.SHORT,
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
                style: TextInputStyleTypes.PARAGRAPH,
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
      type: InteractionResponseType.MODAL,
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
                style: TextInputStyleTypes.PARAGRAPH,
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
    const state = parseFarmState(interaction.channel.topic);
    const nextState = resetFarmWeekState(state);

    await updateFarmChannelTopic(interaction.channel_id, nextState);
    await updateFarmMainMessage(interaction, nextState);
    await postFarmLog(interaction.channel_id, `♻️ Semana resetada por **${interaction.member.user.username}**.`);

    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: '♻️ Semana resetada com sucesso.',
        flags: 64,
      },
    };
  }

  if (customId === 'farm_delete_channel') {
    await deleteChannel(interaction.channel_id);
    logSuccess(`Aba de farm excluída por ${interaction.member.user.username}`);

    return {
      type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE,
    };
  }

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: '⚠️ Ação de farm não reconhecida.',
      flags: 64,
    },
  };
}

module.exports = {
  handleFarmButtonInteraction,
};