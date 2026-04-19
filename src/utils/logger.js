function timestamp() {
  return new Date().toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
  });
}

function logSuccess(message) {
  console.log(`✅ [${timestamp()}] ${message}`);
}

function logInfo(message) {
  console.log(`ℹ️ [${timestamp()}] ${message}`);
}

function logWarn(message) {
  console.warn(`⚠️ [${timestamp()}] ${message}`);
}

function logError(message, error) {
  console.error(`❌ [${timestamp()}] ${message}`);
  if (error) console.error(error);
}

module.exports = {
  logSuccess,
  logInfo,
  logWarn,
  logError,
};