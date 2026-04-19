const { discordRequest } = require('./discord-rest');

async function fetchGuildChannels(guildId) {
  return discordRequest(`/guilds/${guildId}/channels`, {
    method: 'GET',
  });
}

module.exports = {
  fetchGuildChannels,
};