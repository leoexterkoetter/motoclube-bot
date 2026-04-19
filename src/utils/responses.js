const { InteractionResponseType } = require('discord-interactions');

function ephemeral(content, extra = {}) {
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content,
      flags: 64,
      ...extra,
    },
  };
}

module.exports = {
  ephemeral,
};