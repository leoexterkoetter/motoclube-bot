const { discordRequest } = require('./discord-rest');

async function createDmChannel(userId) {
  return discordRequest('/users/@me/channels', {
    method: 'POST',
    body: JSON.stringify({ recipient_id: userId }),
  });
}

async function sendUserDm(userId, content) {
  const dmChannel = await createDmChannel(userId);

  return discordRequest(`/channels/${dmChannel.id}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

module.exports = {
  createDmChannel,
  sendUserDm,
};