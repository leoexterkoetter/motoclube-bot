const API_BASE = 'https://discord.com/api/v10';

async function discordRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bot ${process.env.TOKEN}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (response.status === 429) {
    const data = await response.json().catch(() => ({}));
    const retryAfter = Math.ceil(Number(data.retry_after || 1));

    throw new Error(
      `RATE_LIMIT:${retryAfter}:Ação bloqueada temporariamente pelo Discord. Aguarde ${retryAfter} segundos.`
    );
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Discord API ${response.status}: ${text}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

module.exports = {
  discordRequest,
};