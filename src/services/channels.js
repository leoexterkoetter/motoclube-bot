const { discordRequest } = require('./discord-rest');

async function createGuildChannel(guildId, payload) {
  return discordRequest(`/guilds/${guildId}/channels`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

async function editChannel(channelId, payload) {
  return discordRequest(`/channels/${channelId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

async function getChannel(channelId) {
  return discordRequest(`/channels/${channelId}`, {
    method: 'GET',
  });
}

async function deleteChannel(channelId) {
  return discordRequest(`/channels/${channelId}`, {
    method: 'DELETE',
  });
}

async function sendChannelMessage(channelId, payload) {
  return discordRequest(`/channels/${channelId}/messages`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

async function editMessage(channelId, messageId, payload) {
  return discordRequest(`/channels/${channelId}/messages/${messageId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

module.exports = {
  createGuildChannel,
  editChannel,
  getChannel,
  deleteChannel,
  sendChannelMessage,
  editMessage,
};