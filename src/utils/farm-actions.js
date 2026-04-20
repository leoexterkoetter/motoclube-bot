const { editChannel, editMessage, sendChannelMessage } = require('../services/channels');
const { serializeFarmState } = require('./farm-state');
const { buildFarmControlEmbed } = require('./embeds');

async function updateFarmChannelTopic(channelId, state) {
  return editChannel(channelId, {
    topic: serializeFarmState(state),
  });
}

async function updateFarmMainMessage(channelId, state) {
  if (!state || !state.mainMessageId) {
    throw new Error('mainMessageId não encontrado no estado da aba de farm.');
  }

  return editMessage(channelId, state.mainMessageId, {
    embeds: [buildFarmControlEmbed(state)],
  });
}

async function postFarmLog(channelId, content) {
  return sendChannelMessage(channelId, { content });
}

module.exports = {
  updateFarmChannelTopic,
  updateFarmMainMessage,
  postFarmLog,
};