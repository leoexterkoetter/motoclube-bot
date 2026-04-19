const { COLORS } = require('./constants');
const { formatCurrency } = require('./farm-state');

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
      { name: '👤 Discord', value: discordName || '-', inline: false },
      { name: '🎮 Nome RP', value: nomeRp || '-', inline: true },
      { name: '🆔 ID', value: idCidade || '-', inline: true },
      { name: '📞 Telefone', value: telefone || '-', inline: true },
      { name: '🤝 Indicação', value: indicacao || '-', inline: false },
      { name: '⏰ Data/Hora', value: new Date(createdAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }), inline: false },
      { name: '📌 Status', value: statusText || 'Aguardando', inline: false },
    ],
    footer: {
      text: footerText || 'set_request',
    },
    timestamp: new Date().toISOString(),
  };
}

function buildFarmControlEmbed(state) {
  return {
    title: '📦 Controle de Farm',
    description: 'Acompanhamento individual do membro.',
    color: state.status === 'Meta batida' ? COLORS.SUCCESS : COLORS.INFO,
    fields: [
      { name: '👤 Membro', value: `<@${state.userId}>`, inline: true },
      { name: '🆔 ID Cidade', value: state.idCidade, inline: true },
      { name: '🧑‍💼 Criado por', value: state.criadoPor || '-', inline: true },
      { name: '💰 Meta semanal', value: formatCurrency(state.metaSemanal), inline: true },
      { name: '📈 Total entregue', value: formatCurrency(state.totalEntregue), inline: true },
      { name: '📉 Faltante', value: formatCurrency(state.faltante), inline: true },
      { name: '📊 Progresso', value: `${state.progresso}%`, inline: true },
      { name: '📌 Status', value: state.status, inline: true },
      { name: '🕒 Atualizado em', value: new Date(state.atualizadoEm).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }), inline: true },
      { name: '📝 Observação', value: state.observacao || 'Sem observações.', inline: false },
    ],
    footer: {
      text: 'farm_control',
    },
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  baseEmbed,
  buildSetPanelEmbed,
  buildSetRequestEmbed,
  buildFarmControlEmbed,
};