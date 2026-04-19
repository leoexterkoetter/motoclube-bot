function getStaffRoleIds() {
  const multiple = String(process.env.CARGOS_STAFF || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  const single = String(process.env.CARGO_STAFF || '').trim();

  if (single) {
    multiple.push(single);
  }

  return [...new Set(multiple)];
}

function isStaff(interaction) {
  const memberRoles = interaction.member?.roles || [];
  const allowedRoles = getStaffRoleIds();

  console.log('ROLES DO MEMBRO:', memberRoles);
  console.log('ROLES PERMITIDOS:', allowedRoles);

  return memberRoles.some((roleId) => allowedRoles.includes(String(roleId)));
}

module.exports = {
  getStaffRoleIds,
  isStaff,
};