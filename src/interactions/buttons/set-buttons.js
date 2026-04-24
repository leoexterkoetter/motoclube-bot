const { modal, ephemeral } = require('../../utils/responses');
const { isStaff } = require('../../utils/permissions');
const { parseSetState, serializeSetState } = require('../../utils/set-state');
const {
  buildSetRequestEmbed,
  buildSetDecisionComponents,
} = require('../../utils/embeds');
const { editMessage } = require('../../services/channels');
const { editGuildMember, addGuildMemberRole } = require('../../services/members');
const { sendUserDm } = require('../../services/users');
const { logSuccess, logError } = require('../../utils/logger');

function getSetState(interaction) {
  const footerText = interaction.message?.embeds?.[0]?.footer?.text || '';
  return parseSetState(footerText);
}

function buildSetModal() {
  return modal({
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
            style: 1,
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
            custom_id: 'telefone',
            label: 'Telefone',
            style: 1,
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
            style: 2,
            required: true,
            max_length: 200,
          },
        ],
      },
    ],
  });
}

async function handleSetButtonInteraction(interaction) {
  const customId = interaction.data.custom_id;

  if (customId === 'set_open_modal') {
    return buildSetModal();
  }

  if (!isStaff(interaction)) {
    return ephemeral('❌ Você não possui permissão.');
  }

  const state = getSetState(interaction);

  if (!state.userId) {
    return ephemeral('❌ Dados da solicitação não encontrados.');
  }

  if (customId === 'set_review') {
    const nextState = {
      ...state,
      status: 'review',
      statusText: `🛠️ Em análise por ${interaction.member.user.username}`,
      updatedAt: new Date().toISOString(),
    };

    nextState.footerText = serializeSetState(nextState);

    await editMessage(interaction.channel_id, interaction.message.id, {
      embeds: [buildSetRequestEmbed(nextState)],
      components: buildSetDecisionComponents(false),
    });

    return ephemeral('🛠️ Solicitação marcada como em análise.');
  }

  if (customId === 'set_reject') {
    const nextState = {
      ...state,
      status: 'rejected',
      statusText: `❌ Recusado por ${interaction.member.user.username}`,
      updatedAt: new Date().toISOString(),
    };

    nextState.footerText = serializeSetState(nextState);

    await editMessage(interaction.channel_id, interaction.message.id, {
      embeds: [buildSetRequestEmbed(nextState)],
      components: buildSetDecisionComponents(true),
    });

    try {
      await sendUserDm(state.userId, 'Sua solicitação foi recusada.');
    } catch (error) {
      logError('Não foi possível enviar DM de recusa', error);
    }

    logSuccess(`Solicitação recusada por ${interaction.member.user.username}`);
    return ephemeral('❌ Solicitação recusada.');
  }

  if (customId === 'set_approve') {
    try {
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
        statusText: `✅ Aprovado por ${interaction.member.user.username}`,
        updatedAt: new Date().toISOString(),
      };

      nextState.footerText = serializeSetState(nextState);

      await editMessage(interaction.channel_id, interaction.message.id, {
        embeds: [buildSetRequestEmbed(nextState)],
        components: buildSetDecisionComponents(true),
      });

      try {
        await sendUserDm(state.userId, 'Parabéns! Seu set foi aprovado.');
      } catch (error) {
        logError('Não foi possível enviar DM de aprovação', error);
      }

      logSuccess(`Solicitação aprovada por ${interaction.member.user.username}`);
      return ephemeral('✅ Solicitação aprovada.');
    } catch (error) {
      logError('Erro ao aprovar set', error);
      return ephemeral(
        '❌ Erro ao aprovar. Verifique permissões do bot, hierarquia de cargos e IDs dos cargos.'
      );
    }
  }

  return ephemeral('⚠️ Ação de set não reconhecida.');
}

module.exports = {
  handleSetButtonInteraction,
};