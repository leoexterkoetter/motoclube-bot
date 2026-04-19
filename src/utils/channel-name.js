function sanitizeChannelName(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function buildFarmChannelName(name, cityId) {
  const safeName = sanitizeChannelName(name);
  const safeId = String(cityId).replace(/[^0-9]/g, '');
  return `${safeName}-${safeId}`;
}

module.exports = {
  sanitizeChannelName,
  buildFarmChannelName,
};