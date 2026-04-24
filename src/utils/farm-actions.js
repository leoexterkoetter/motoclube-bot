const { editChannel, editMessage, sendChannelMessage } = require('../services/channels');
const { serializeFarmState } = require('./farm-state');
const { buildFarmEmbed } = require('./embeds');

async function saveFarmState(channelId, state) {
  return editChannel(channelId, {
    topic: serializeFarmState(state),
  });
}

async function updateFarmEmbed(channelId, state) {
  if (!state.mainMessageId) {
    throw new Error('mainMessageId não encontrado no estado da farm.');
  }

  return editMessage(channelId, state.mainMessageId, {
    embeds: [buildFarmEmbed(state)],
  });
}

async function updateFarm(channelId, state) {
  await saveFarmState(channelId, state);
  await updateFarmEmbed(channelId, state);
}

async function logFarm(channelId, content) {
  return sendChannelMessage(channelId, {
    content,
  });
}

module.exports = {
  saveFarmState,
  updateFarmEmbed,
  updateFarm,
  logFarm,
};