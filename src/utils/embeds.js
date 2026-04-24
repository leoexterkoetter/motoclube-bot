const { COLORS } = require('./constants');

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });
}

/* =========================
   SET
========================= */

function buildSetPanelEmbed() {
  return {
    title: '🏍️ SOLICITAR SET',
    description:
      'Clique no botão abaixo para preencher seu cadastro e solicitar entrada na facção.',
    color: COLORS.INFO,
    footer: {
      text: 'Sistema de recrutamento da facção',
    },
    timestamp: new Date().toISOString(),
  };
}

function buildSetPanelComponents() {
  return [
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 1,
          custom_id: 'set_open_modal',
          label: 'Solicitar Set',
          emoji: { name: '📝' },
        },
      ],
    },
  ];
}

function buildSetRequestEmbed(state) {
  return {
    title: '📥 Nova Solicitação de Set',
    color: COLORS.WARNING,
    fields: [
      {
        name: '👤 Discord',
        value: state.discordName || '-',
        inline: false,
      },
      {
        name: '🎮 Nome RP',
        value: state.nomeRp || '-',
        inline: true,
      },
      {
        name: '🆔 ID',
        value: state.idCidade || '-',
        inline: true,
      },
      {
        name: '📞 Telefone',
        value: state.telefone || '-',
        inline: true,
      },
      {
        name: '🤝 Indicação',
        value: state.indicacao || '-',
        inline: false,
      },
      {
        name: '📌 Status',
        value: state.statusText || '⏳ Aguardando análise',
        inline: false,
      },
      {
        name: '⏰ Data/Hora',
        value: new Date(state.createdAt || Date.now()).toLocaleString('pt-BR', {
          timeZone: 'America/Sao_Paulo',
        }),
        inline: false,
      },
    ],
    footer: {
      text: state.footerText || 'set_request',
    },
    timestamp: new Date().toISOString(),
  };
}

function buildSetDecisionComponents(disabled = false) {
  return [
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 3,
          custom_id: disabled ? 'set_approve_done' : 'set_approve',
          label: 'Aprovar',
          disabled,
          emoji: { name: '✅' },
        },
        {
          type: 2,
          style: 4,
          custom_id: disabled ? 'set_reject_done' : 'set_reject',
          label: 'Recusar',
          disabled,
          emoji: { name: '❌' },
        },
        {
          type: 2,
          style: 2,
          custom_id: disabled ? 'set_review_done' : 'set_review',
          label: 'Revisar',
          disabled,
          emoji: { name: '🛠️' },
        },
      ],
    },
  ];
}

/* =========================
   FARM
========================= */

function buildFarmEmbed(state) {
  return {
    title: '📦 Controle de Farm',
    description: 'Acompanhamento individual do membro.',
    color: state.status === 'Meta batida' ? COLORS.SUCCESS : COLORS.INFO,
    fields: [
      {
        name: '👤 Membro',
        value: `<@${state.userId}>`,
        inline: true,
      },
      {
        name: '🆔 ID Cidade',
        value: state.idCidade || '-',
        inline: true,
      },
      {
        name: '🧑‍💼 Criado por',
        value: state.criadoPor || '-',
        inline: true,
      },
      {
        name: '💰 Meta semanal',
        value: state.metaFormatada || formatCurrency(state.metaSemanal),
        inline: true,
      },
      {
        name: '📈 Total entregue',
        value: state.totalFormatado || formatCurrency(state.totalEntregue),
        inline: true,
      },
      {
        name: '📉 Faltante',
        value: state.faltanteFormatado || formatCurrency(state.faltante),
        inline: true,
      },
      {
        name: '📊 Progresso',
        value: `${state.progresso || 0}%`,
        inline: true,
      },
      {
        name: '📌 Status',
        value: state.status || 'Pendente',
        inline: true,
      },
      {
        name: '🕒 Atualizado em',
        value: new Date(state.atualizadoEm || Date.now()).toLocaleString('pt-BR', {
          timeZone: 'America/Sao_Paulo',
        }),
        inline: true,
      },
      {
        name: '📝 Observação',
        value: state.observacao || 'Sem observações.',
        inline: false,
      },
    ],
    footer: {
      text: 'farm_control',
    },
    timestamp: new Date().toISOString(),
  };
}

function buildFarmComponents() {
  return [
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 3,
          custom_id: 'farm_register_delivery',
          label: 'Registrar entrega',
          emoji: { name: '✅' },
        },
        {
          type: 2,
          style: 1,
          custom_id: 'farm_update_goal',
          label: 'Atualizar meta',
          emoji: { name: '💰' },
        },
        {
          type: 2,
          style: 2,
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
          type: 2,
          style: 2,
          custom_id: 'farm_reset_week',
          label: 'Resetar semana',
          emoji: { name: '♻️' },
        },
        {
          type: 2,
          style: 4,
          custom_id: 'farm_delete_channel',
          label: 'Excluir aba',
          emoji: { name: '🗑️' },
        },
      ],
    },
  ];
}

module.exports = {
  formatCurrency,

  buildSetPanelEmbed,
  buildSetPanelComponents,
  buildSetRequestEmbed,
  buildSetDecisionComponents,

  buildFarmEmbed,
  buildFarmComponents,
};