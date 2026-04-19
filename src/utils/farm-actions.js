const { editChannel, editMessage, sendChannelMessage } = require('../services/channels');
const { serializeFarmState } = require('./farm-state');
const { buildFarmControlEmbed } = require('./embeds');

async function updateFarmChannelTopic(channelId, state) {
  return editChannel(channelId, {
    topic: serializeFarmState(state),
  });
}

async function updateFarmMainMessage(interaction, state) {
  return editMessage(interaction.channel_id, interaction.message.id, {
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