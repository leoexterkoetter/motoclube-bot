const {
  InteractionResponseType,
  MessageComponentTypes,
  ButtonStyleTypes,
  TextInputStyleTypes,
} = require('discord-interactions');
const { isStaff } = require('../../utils/permissions');
const { ephemeral } = require('../../utils/responses');
const { editGuildMember, addGuildMemberRole } = require('../../services/members');
const { editMessage } = require('../../services/channels');
const { sendUserDm } = require('../../services/users');
const { parseSetState, serializeSetState } = require('../../utils/set-state');
const { buildSetRequestEmbed, buildSetDecisionComponents } = require('../../utils/embeds');
const { logSuccess } = require('../../utils/logger');

function getStateFromMessage(interaction) {
  const footerText = interaction.message?.embeds?.[0]?.footer?.text || '';
  return parseSetState(footerText);
}

function buildDisabledComponents() {
  return [
    {
      type: 1,
      components: [
        {
          type: MessageComponentTypes.BUTTON,
          style: ButtonStyleTypes.SUCCESS,
          custom_id: 'set_approve_done',
          label: 'Aprovar',
          disabled: true,
          emoji: { name: '✅' },
        },
        {
          type: MessageComponentTypes.BUTTON,
          style: ButtonStyleTypes.DANGER,
          custom_id: 'set_reject_done',
          label: 'Recusar',
          disabled: true,
          emoji: { name: '❌' },
        },
        {
          type: MessageComponentTypes.BUTTON,
          style: ButtonStyleTypes.SECONDARY,
          custom_id: 'set_review_done',
          label: 'Revisar',
          disabled: true,
          emoji: { name: '🛠' },
        },
      ],
    },
  ];
}

async function handleSetButtonInteraction(interaction) {
  const customId = interaction.data.custom_id;

  if (customId === 'set_open_modal') {
    return {
      type: InteractionResponseType.MODAL,
      data: {
        custom_id: 'set_submit_modal',
        title: 'Solicitar Set',
        components: [
          {
            type: 1,
            components: [
              {
                type: 4,
                custom_id: 'nome_rp',
                label: 'Nome no RP',
                style: TextInputStyleTypes.SHORT,
                required: true,
                max_length: 100,
              },
            ],
          },
          {
            type: 1,
            components: [
              {
                type: 4,
                custom_id: 'id_cidade',
                label: 'ID da Cidade',
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
                custom_id: 'telefone',
                label: 'Telefone',
                style: TextInputStyleTypes.SHORT,
                required: true,
                max_length: 30,
              },
            ],
          },
          {
            type: 1,
            components: [
              {
                type: 4,
                custom_id: 'indicacao',
                label: 'Indicação / Quem chamou',
                style: TextInputStyleTypes.PARAGRAPH,
                required: true,
                max_length: 200,
              },
            ],
          },
        ],
      },
    };
  }

  if (!isStaff(interaction)) {
    return ephemeral('❌ Você não possui permissão.');
  }

  const state = getStateFromMessage(interaction);

  if (!state.userId) {
    return ephemeral('❌ Não foi possível localizar os dados da solicitação.');
  }

  if (customId === 'set_review') {
    const nextState = {
      ...state,
      status: 'review',
      statusText: `🛠 Em análise por ${interaction.member.user.username}`,
      reviewedBy: interaction.member.user.username,
      updatedAt: new Date().toISOString(),
    };

    await editMessage(interaction.channel_id, interaction.message.id, {
      embeds: [
        buildSetRequestEmbed({
          ...nextState,
          footerText: serializeSetState(nextState),
        }),
      ],
      components: buildSetDecisionComponents(),
    });

    return ephemeral('🛠 Solicitação marcada como em análise.');
  }

  if (customId === 'set_approve') {
    const nickname = `${state.nomeRp} | ${state.idCidade}`.slice(0, 32);

    await editGuildMember(process.env.GUILD_ID, state.userId, {
      nick: nickname,
    });

    if (process.env.CARGO_RECRUTA) {
      await addGuildMemberRole(process.env.GUILD_ID, state.userId, process.env.CARGO_RECRUTA);
    }

    if (process.env.CARGO_MEMBRO) {
      await addGuildMemberRole(process.env.GUILD_ID, state.userId, process.env.CARGO_MEMBRO);
    }

    const nextState = {
      ...state,
      status: 'approved',
      statusText: `✅ Solicitação aprovada por ${interaction.member.user.username}`,
      approvedBy: interaction.member.user.username,
      updatedAt: new Date().toISOString(),
    };

    await editMessage(interaction.channel_id, interaction.message.id, {
      embeds: [
        buildSetRequestEmbed({
          ...nextState,
          footerText: serializeSetState(nextState),
        }),
      ],
      components: buildDisabledComponents(),
    });

    try {
      await sendUserDm(state.userId, 'Parabéns! Seu set foi aprovado.');
    } catch (_error) {}

    logSuccess(`Aprovado por ${interaction.member.user.username}`);
    return ephemeral('✅ Solicitação aprovada com sucesso.');
  }

  if (customId === 'set_reject') {
    const nextState = {
      ...state,
      status: 'rejected',
      statusText: `❌ Solicitação recusada por ${interaction.member.user.username}`,
      rejectedBy: interaction.member.user.username,
      updatedAt: new Date().toISOString(),
    };

    await editMessage(interaction.channel_id, interaction.message.id, {
      embeds: [
        buildSetRequestEmbed({
          ...nextState,
          footerText: serializeSetState(nextState),
        }),
      ],
      components: buildDisabledComponents(),
    });

    try {
      await sendUserDm(state.userId, 'Sua solicitação foi recusada.');
    } catch (_error) {}

    logSuccess(`Recusado por ${interaction.member.user.username}`);
    return ephemeral('❌ Solicitação recusada com sucesso.');
  }

  return ephemeral('⚠️ Ação não reconhecida.');
}

module.exports = {
  handleSetButtonInteraction,
};