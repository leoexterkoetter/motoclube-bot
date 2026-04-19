const {
  InteractionResponseType,
  ChannelTypes,
  PermissionFlagsBits,
  MessageComponentTypes,
  ButtonStyleTypes,
} = require('discord-interactions');
const { isStaff } = require('../utils/permissions');
const { buildFarmChannelName } = require('../utils/channel-name');
const { createGuildChannel, sendChannelMessage } = require('../services/channels');
const { fetchGuildChannels } = require('../services/guild');
const { buildFarmControlEmbed } = require('../utils/embeds');
const { serializeFarmState } = require('../utils/farm-state');
const { logSuccess } = require('../utils/logger');

function getOption(interaction, name) {
  return interaction.data.options?.find((option) => option.name === name)?.value;
}

async function handleCriarFarmCommand(interaction) {
  if (!isStaff(interaction)) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: '❌ Você não possui permissão para usar este comando.',
        flags: 64,
      },
    };
  }

  const memberId = getOption(interaction, 'membro');
  const cityId = getOption(interaction, 'id_cidade');
  const metaSemanal = Number(getOption(interaction, 'meta_semanal'));
  const observacao = getOption(interaction, 'observacao') || 'Sem observações iniciais.';

  const resolvedMember = interaction.data.resolved?.users?.[memberId];
  const resolvedGuildMember = interaction.data.resolved?.members?.[memberId];

  const displayName = resolvedGuildMember?.nick || resolvedMember?.username || 'membro';
  const channelName = buildFarmChannelName(displayName, cityId);

  const channels = await fetchGuildChannels(process.env.GUILD_ID);
  const alreadyExists = channels.some((channel) => channel.name === channelName);

  if (alreadyExists) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: '❌ Já existe uma aba de farm para este membro.',
        flags: 64,
      },
    };
  }

  const farmState = {
    userId: memberId,
    discordName: resolvedMember?.username || displayName,
    nomeExibicao: displayName,
    idCidade: String(cityId),
    metaSemanal,
    totalEntregue: 0,
    faltante: metaSemanal,
    progresso: 0,
    status: 'Pendente',
    observacao,
    criadoPor: interaction.member.user.username,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  };

  const permissionOverwrites = [
    {
      id: process.env.GUILD_ID,
      type: 0,
      deny: String(PermissionFlagsBits.ViewChannel),
    },
    {
      id: process.env.CARGO_STAFF,
      type: 0,
      allow: String(
        PermissionFlagsBits.ViewChannel |
        PermissionFlagsBits.SendMessages |
        PermissionFlagsBits.ReadMessageHistory
      ),
    },
    {
      id: memberId,
      type: 1,
      allow: String(
        PermissionFlagsBits.ViewChannel |
        PermissionFlagsBits.SendMessages |
        PermissionFlagsBits.ReadMessageHistory
      ),
    },
  ];

  const createdChannel = await createGuildChannel(process.env.GUILD_ID, {
    name: channelName,
    type: ChannelTypes.GUILD_TEXT,
    parent_id: process.env.CATEGORIA_FARM || undefined,
    topic: serializeFarmState(farmState),
    permission_overwrites: permissionOverwrites,
  });

  await sendChannelMessage(createdChannel.id, {
    content: `<@${memberId}>`,
    embeds: [buildFarmControlEmbed(farmState)],
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

  logSuccess(`Aba de farm criada para ${displayName}.`);

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: `✅ Aba de farm criada com sucesso: <#${createdChannel.id}>`,
      flags: 64,
    },
  };
}

module.exports = {
  handleCriarFarmCommand,
};