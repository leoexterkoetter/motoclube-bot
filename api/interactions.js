require('dotenv').config();

const express = require('express');
const {
  InteractionType,
  InteractionResponseType,
  verifyKeyMiddleware,
} = require('discord-interactions');
const { handleInteraction } = require('../src/app');
const { logSuccess, logInfo, logError } = require('../src/utils/logger');

const app = express();

app.get('/api/interactions', (_req, res) => {
  return res.status(200).json({
    ok: true,
    service: 'bot-discord-gta-rp',
  });
});

app.post(
  '/api/interactions',
  verifyKeyMiddleware(process.env.PUBLIC_KEY),
  async (req, res) => {
    try {
      const interaction = req.body;

      if (interaction.type === InteractionType.PING) {
        return res.send({ type: InteractionResponseType.PONG });
      }

      const response = await handleInteraction(interaction);
      return res.send(response);
    } catch (error) {
      logError('Erro ao processar interação.', error);
      return res.status(500).json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '❌ Erro interno ao processar interação.',
          flags: 64,
        },
      });
    }
  }
);

if (require.main === module) {
  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    logSuccess(`Bot base online em http://localhost:${port}`);
    logInfo('Endpoint pronto em /api/interactions');
  });
}

module.exports = app;