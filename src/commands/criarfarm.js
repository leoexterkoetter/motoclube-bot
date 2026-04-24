const {
  ChannelTypes,
  MessageComponentTypes,
  ButtonStyleTypes,
} = require('discord-interactions');

const { isStaff, getStaffRoleIds } = require('../utils/permissions');
const { ephemeral } = require('../utils/responses');
const { buildFarmChannelName } = require('../utils/channel-name');
const { fetchGuildChannels } = require('../services/guild');
const { createGuildChannel, sendChannelMessage, editChannel } = require('../services/channels');
const { buildFarmEmbed, buildFarmComponents } = require('../utils/embeds');
const {
  createFarmState,
  serializeFarmState,
} = require('../utils/farm-state');
const { logSuccess, logError } = require('../utils/logger');

const PERMISSIONS = {
  VIEW_CHANNEL: 1024n,
  SEND_MESSAGES: 2048n,
  READ_MESSAGE_HISTORY: 65536n,
};

function allowBasicChannel() {
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

function getCleanName(rawName, cityId) {
  let name = String(rawName || 'membro');

  if (name.includes('|')) {
    name = name.split('|')[0].trim();
  }

  name = name.replace(String(cityId), '').trim();

  return name || 'membro';
}

function buildPermissionOverwrites(memberId) {
  const staffRoles = getStaffRoleIds();

  return [
    {
      id: process.env.GUILD_ID,
      type: 0,
      deny: denyViewChannel(),
    },
    ...staffRoles.map((roleId) => ({
      id: roleId,
      type: 0,
      allow: allowBasicChannel(),
    })),
    {
      id: memberId,
      type: 1,
      allow: allowBasicChannel(),
    },
  ];
}

async function handleCriarFarmCommand(interaction) {
  try {
    if (!isStaff(interaction)) {
      return ephemeral('❌ Você não possui permissão para usar este comando.');
    }

    const memberId = getOption(interaction, 'membro');
    const cityId = String(getOption(interaction, 'id_cidade') || '').trim();
    const metaSemanal = Number(getOption(interaction, 'meta_semanal') || 0);
    const observacao = getOption(interaction, 'observacao') || 'Sem observações iniciais.';

    if (!memberId || !cityId || !metaSemanal) {
      return ephemeral('❌ Dados inválidos. Informe membro, ID e meta semanal.');
    }

    const resolvedUser = interaction.data.resolved?.users?.[memberId];
    const resolvedMember = interaction.data.resolved?.members?.[memberId];

    const displayName = getCleanName(
      resolvedMember?.nick || resolvedUser?.username || 'membro',
      cityId
    );

    const channelName = buildFarmChannelName(displayName, cityId);

    const channels = await fetchGuildChannels(process.env.GUILD_ID);
    const exists = channels.some((channel) => channel.name === channelName);

    if (exists) {
      return ephemeral(`❌ Já existe uma aba de farm chamada \`${channelName}\`.`);
    }

    const state = createFarmState({
      userId: memberId,
      discordName: resolvedUser?.username || displayName,
      nomeExibicao: displayName,
      idCidade: cityId,
      metaSemanal,
      observacao,
      criadoPor: interaction.member.user.username,
    });

    const payload = {
      name: channelName,
      type: ChannelTypes.GUILD_TEXT,
      permission_overwrites: buildPermissionOverwrites(memberId),
    };

    if (process.env.CATEGORIA_FARM) {
      payload.parent_id = process.env.CATEGORIA_FARM;
    }

    const channel = await createGuildChannel(process.env.GUILD_ID, payload);

    const mainMessage = await sendChannelMessage(channel.id, {
      content: `<@${memberId}>`,
      embeds: [buildFarmEmbed(state)],
      components: buildFarmComponents(),
    });

    const finalState = {
      ...state,
      channelId: channel.id,
      mainMessageId: mainMessage.id,
    };

    await editChannel(channel.id, {
      topic: serializeFarmState(finalState),
    });

    await sendChannelMessage(channel.id, {
      content: `✅ Aba criada por **${interaction.member.user.username}**. Meta semanal: **${state.metaFormatada}**.`,
    });

    logSuccess(`Aba de farm criada: ${channelName}`);

    return ephemeral(`✅ Aba de farm criada com sucesso: <#${channel.id}>`);
  } catch (error) {
    logError('Erro ao criar farm', error);
    return ephemeral('❌ Erro ao criar aba de farm. Verifique os logs da Vercel.');
  }
}

module.exports = {
  handleCriarFarmCommand,
};