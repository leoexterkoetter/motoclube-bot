function serializeFarmState(state) {
  return `farm_state:${Buffer.from(JSON.stringify(state)).toString('base64')}`;
}

function parseFarmState(topicText) {
  if (!topicText || !topicText.startsWith('farm_state:')) {
    return {
      userId: '',
      discordName: '',
      nomeExibicao: '',
      idCidade: '',
      metaSemanal: 0,
      totalEntregue: 0,
      faltante: 0,
      progresso: 0,
      status: 'Pendente',
      observacao: 'Sem observações.',
      criadoPor: '',
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
  }

  try {
    const base64 = topicText.replace('farm_state:', '');
    return JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
  } catch {
    return {
      userId: '',
      discordName: '',
      nomeExibicao: '',
      idCidade: '',
      metaSemanal: 0,
      totalEntregue: 0,
      faltante: 0,
      progresso: 0,
      status: 'Pendente',
      observacao: 'Sem observações.',
      criadoPor: '',
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
  }
}

function calculateFarmProgress(state) {
  const meta = Number(state.metaSemanal || 0);
  const entregue = Number(state.totalEntregue || 0);
  const faltante = Math.max(meta - entregue, 0);
  const progresso = meta > 0 ? Math.min(Math.round((entregue / meta) * 100), 999) : 0;

  let status = 'Pendente';
  if (entregue > 0 && entregue < meta) status = 'Em andamento';
  if (meta > 0 && entregue >= meta) status = 'Meta batida';

  return {
    ...state,
    metaSemanal: meta,
    totalEntregue: entregue,
    faltante,
    progresso,
    status,
  };
}

function resetFarmWeekState(state) {
  return calculateFarmProgress({
    ...state,
    totalEntregue: 0,
    atualizadoEm: new Date().toISOString(),
  });
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });
}

module.exports = {
  serializeFarmState,
  parseFarmState,
  calculateFarmProgress,
  resetFarmWeekState,
  formatCurrency,
};