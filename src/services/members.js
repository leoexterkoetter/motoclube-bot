const { discordRequest } = require('./discord-rest');

async function editGuildMember(guildId, userId, payload) {
  return discordRequest(`/guilds/${guildId}/members/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

async function addGuildMemberRole(guildId, userId, roleId) {
  return discordRequest(`/guilds/${guildId}/members/${userId}/roles/${roleId}`, {
    method: 'PUT',
  });
}

async function removeGuildMemberRole(guildId, userId, roleId) {
  return discordRequest(`/guilds/${guildId}/members/${userId}/roles/${roleId}`, {
    method: 'DELETE',
  });
}

module.exports = {
  editGuildMember,
  addGuildMemberRole,
  removeGuildMemberRole,
};