const {
  MessageComponentTypes,
  ButtonStyleTypes,
} = require('discord-interactions');
const { COLORS } = require('./constants');

function baseEmbed({ title, description, color = COLORS.INFO, fields = [], footer }) {
  return {
    title,
    description,
    color,
    fields,
    footer: footer ? { text: footer } : undefined,
    timestamp: new Date().toISOString(),
  };
}

function buildSetPanelEmbed() {
  return {
    title: '🏍️ SOLICITAR SET',
    description: 'Clique no botão abaixo para preencher seu cadastro e solicitar entrada na facção.',
    color: COLORS.INFO,
    footer: {
      text: 'Sistema de recrutamento da facção',
    },
    timestamp: new Date().toISOString(),
  };
}

function buildSetRequestEmbed({
  discordName,
  nomeRp,
  idCidade,
  telefone,
  indicacao,
  createdAt,
  statusText,
  footerText,
}) {
  return {
    title: 'Nova Solicitação de Set',
    color: COLORS.WARNING,
    fields: [
      {
        name: '👤 Discord',
        value: discordName || '-',
        inline: false,
      },
      {
        name: '🎮 Nome RP',
        value: nomeRp || '-',
        inline: true,
      },
      {
        name: '🆔 ID',
        value: idCidade || '-',
        inline: true,
      },
      {
        name: '📞 Telefone',
        value: telefone || '-',
        inline: true,
      },
      {
        name: '🤝 Indicação',
        value: indicacao || '-',
        inline: false,
      },
      {
        name: '⏰ Data/Hora',
        value: new Date(createdAt).toLocaleString('pt-BR', {
          timeZone: 'America/Sao_Paulo',
        }),
        inline: false,
      },
      {
        name: '📌 Status',
        value: statusText || 'Aguardando',
        inline: false,
      },
    ],
    footer: {
      text: footerText || 'set_request',
    },
    timestamp: new Date().toISOString(),
  };
}

function buildSetDecisionComponents() {
  return [
    {
      type: 1,
      components: [
        {
          type: MessageComponentTypes.BUTTON,
          style: ButtonStyleTypes.SUCCESS,
          custom_id: 'set_approve',
          label: 'Aprovar',
          emoji: { name: '✅' },
        },
        {
          type: MessageComponentTypes.BUTTON,
          style: ButtonStyleTypes.DANGER,
          custom_id: 'set_reject',
          label: 'Recusar',
          emoji: { name: '❌' },
        },
        {
          type: MessageComponentTypes.BUTTON,
          style: ButtonStyleTypes.SECONDARY,
          custom_id: 'set_review',
          label: 'Revisar',
          emoji: { name: '🛠' },
        },
      ],
    },
  ];
}

module.exports = {
  baseEmbed,
  buildSetPanelEmbed,
  buildSetRequestEmbed,
  buildSetDecisionComponents,
};