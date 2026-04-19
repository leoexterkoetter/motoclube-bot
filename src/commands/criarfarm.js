const { ephemeral } = require('../utils/responses');

async function handleCriarFarmCommand() {
  return ephemeral('⚠️ O módulo /criarfarm será conectado na Parte 3.');
}

module.exports = {
  handleCriarFarmCommand,
};