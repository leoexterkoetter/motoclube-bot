const { formatCurrency } = require('./embeds');

function calculateFarmProgress(state) {
  const meta = Number(state.metaSemanal || 0);
  const total = Number(state.totalEntregue || 0);

  const faltante = Math.max(meta - total, 0);
  const progresso = meta > 0 ? Math.min(Math.round((total / meta) * 100), 999) : 0;

  let status = 'Pendente';

  if (total > 0 && total < meta) {
    status = 'Em andamento';
  }

  if (meta > 0 && total >= meta) {
    status = 'Meta batida';
  }

  return {
    ...state,
    metaSemanal: meta,
    totalEntregue: total,
    faltante,
    progresso,
    status,
    metaFormatada: formatCurrency(meta),
    totalFormatado: formatCurrency(total),
    faltanteFormatado: formatCurrency(faltante),
  };
}

function createFarmState({
  userId,
  discordName,
  nomeExibicao,
  idCidade,
  metaSemanal,
  observacao,
  criadoPor,
}) {
  return calculateFarmProgress({
    userId,
    discordName,
    nomeExibicao,
    idCidade,
    metaSemanal,
    totalEntregue: 0,
    observacao: observacao || 'Sem observações.',
    criadoPor,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
    channelId: '',
    mainMessageId: '',
  });
}

function serializeFarmState(state) {
  return `farm_state:${Buffer.from(JSON.stringify(state)).toString('base64')}`;
}

function parseFarmState(topicText) {
  if (!topicText || !topicText.startsWith('farm_state:')) {
    return {};
  }

  try {
    const base64 = topicText.replace('farm_state:', '');
    return JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
  } catch {
    return {};
  }
}

function resetFarmState(state) {
  return calculateFarmProgress({
    ...state,
    totalEntregue: 0,
    atualizadoEm: new Date().toISOString(),
  });
}

module.exports = {
  calculateFarmProgress,
  createFarmState,
  serializeFarmState,
  parseFarmState,
  resetFarmState,
};