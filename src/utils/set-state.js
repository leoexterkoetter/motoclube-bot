function serializeSetState(state) {
  return `set_state:${Buffer.from(JSON.stringify(state)).toString('base64')}`;
}

function parseSetState(footerText) {
  if (!footerText || !footerText.startsWith('set_state:')) {
    return {};
  }

  try {
    const base64 = footerText.replace('set_state:', '');
    return JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
  } catch {
    return {};
  }
}

module.exports = {
  serializeSetState,
  parseSetState,
};