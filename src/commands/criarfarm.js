const {
  InteractionResponseType,
  ChannelTypes,
  MessageComponentTypes,
  ButtonStyleTypes,
} = require('discord-interactions');
const { isStaff, getStaffRoleIds } = require('../utils/permissions');
const { ephemeral } = require('../utils/responses');
const { buildFarmChannelName } = require('../utils/channel-name');
const { createGuildChannel, sendChannelMessage, editChannel } = require('../services/channels');
const { fetchGuildChannels } = require('../services/guild');
const { buildFarmControlEmbed } = require('../utils/embeds');
const { serializeFarmState, calculateFarmProgress } = require('../utils/farm-state');
const { logSuccess, logError } = require('../utils/logger');

// Permissões do Discord em bigint/string
const PERMISSIONS = {
  VIEW_CHANNEL: 1024n,
  SEND_MESSAGES: 2048n,
  READ_MESSAGE_HISTORY: 65536n,
};

function allowChannelBasic() {
  return String(
    PERMISSIONS.VIEW_CHANNEL |
    PERMISSIONS.SEND_MESSAGES |
    PERMISSIONS.READ_MESSAGE_HISTORY
  );
}

function denyViewChannel() {
  return String(PERMISSIONS.VIEW_CHANNEL);
}

function getOption(interaction, name) {
  return interaction.data.options?.find((option) => option.name === name)?.value;
}

function buildStaffPermissionOverwrites() {
  const staffRoleIds = getStaffRoleIds();

  return staffRoleIds.map((roleId) => ({
    id: roleId,
    type: 0,
    allow: allowChannelBasic(),
  }));
}

async function handleCriarFarmCommand(interaction) {
  try {
    if (!isStaff(interaction)) {
      return ephemeral('❌ Você não possui permissão para usar este comando.');
    }

    const memberId = getOption(interaction, 'membro');
    const cityId = String(getOption(interaction, 'id_cidade') || '');
    const metaSemanal = Number(getOption(interaction, 'meta_semanal') || 0);
    const observacao = getOption(interaction, 'observacao') || 'Sem observações iniciais.';

    console.log('CRIARFARM memberId:', memberId);
    console.log('CRIARFARM cityId:', cityId);
    console.log('CRIARFARM metaSemanal:', metaSemanal);
    console.log('CRIARFARM categoria:', process.env.CATEGORIA_FARM);

    if (!memberId || !cityId || !metaSemanal) {
      return ephemeral('❌ Dados inválidos para criar a aba de farm.');
    }

    const resolvedUser = interaction.data.resolved?.users?.[memberId];
    const resolvedGuildMember = interaction.data.resolved?.members?.[memberId];
    const displayName = resolvedGuildMember?.nick || resolvedUser?.username || 'membro';
    const channelName = buildFarmChannelName(displayName, cityId);

    const channels = await fetchGuildChannels(process.env.GUILD_ID);
    const alreadyExists = channels.some((channel) => channel.name === channelName);

    if (alreadyExists) {
      return ephemeral('❌ Já existe uma aba de farm para este membro.');
    }

    const baseState = calculateFarmProgress({
      userId: memberId,
      discordName: resolvedUser?.username || displayName,
      nomeExibicao: displayName,
      idCidade: cityId,
      metaSemanal,
      totalEntregue: 0,
      faltante: metaSemanal,
      progresso: 0,
      status: 'Pendente',
      observacao,
      criadoPor: interaction.member.user.username,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      mainMessageId: '',
    });

    const permissionOverwrites = [
      {
        id: process.env.GUILD_ID,
        type: 0,
        deny: denyViewChannel(),
      },
      ...buildStaffPermissionOverwrites(),
      {
        id: memberId,
        type: 1,
        allow: allowChannelBasic(),
      },
    ];

    const channelPayload = {
      name: channelName,
      type: ChannelTypes.GUILD_TEXT,
      topic: serializeFarmState(baseState),
      permission_overwrites: permissionOverwrites,
    };

    if (process.env.CATEGORIA_FARM) {
      channelPayload.parent_id = process.env.CATEGORIA_FARM;
    }

    console.log('CRIARFARM payload canal:', JSON.stringify(channelPayload, null, 2));

    const createdChannel = await createGuildChannel(process.env.GUILD_ID, channelPayload);

    const mainMessage = await sendChannelMessage(createdChannel.id, {
      content: `<@${memberId}>`,
      embeds: [buildFarmControlEmbed(baseState)],
      components: [
        {
          type: 1,
          components: [
            {
              type: MessageComponentTypes.BUTTON,
              style: ButtonStyleTypes.SUCCESS,
              custom_id: 'farm_register_delivery',
              label: 'Registrar entrega',
              emoji: { name: '✅' },
            },
            {
              type: MessageComponentTypes.BUTTON,
              style: ButtonStyleTypes.PRIMARY,
              custom_id: 'farm_update_goal',
              label: 'Atualizar meta',
              emoji: { name: '💰' },
            },
            {
              type: MessageComponentTypes.BUTTON,
              style: ButtonStyleTypes.SECONDARY,
              custom_id: 'farm_add_note',
              label: 'Adicionar observação',
              emoji: { name: '📝' },
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              type: MessageComponentTypes.BUTTON,
              style: ButtonStyleTypes.SECONDARY,
              custom_id: 'farm_reset_week',
              label: 'Resetar semana',
              emoji: { name: '♻️' },
            },
            {
              type: MessageComponentTypes.BUTTON,
              style: ButtonStyleTypes.DANGER,
              custom_id: 'farm_delete_channel',
              label: 'Excluir aba',
              emoji: { name: '🗑️' },
            },
          ],
        },
      ],
    });

    const finalState = {
      ...baseState,
      mainMessageId: mainMessage.id,
    };

    await editChannel(createdChannel.id, {
      topic: serializeFarmState(finalState),
    });

    logSuccess(`Aba de farm criada para ${displayName}.`);

    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `✅ Aba de farm criada com sucesso: <#${createdChannel.id}>`,
        flags: 64,
      },
    };
  } catch (error) {
    logError('Erro ao criar aba de farm.', error);
    return ephemeral('❌ Erro ao criar aba de farm. Verifique os logs da Vercel.');
  }
}

module.exports = {
  handleCriarFarmCommand,
};