function memberHasRole(interaction, roleId) {
  const memberRoles = interaction.member?.roles || [];
  return memberRoles.includes(roleId);
}

function getStaffRoleIds() {
  return String(process.env.CARGOS_STAFF || process.env.CARGO_STAFF || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function isStaff(interaction) {
  const roles = getStaffRoleIds();
  if (roles.length === 0) return false;
  return roles.some((roleId) => memberHasRole(interaction, roleId));
}

module.exports = {
  memberHasRole,
  getStaffRoleIds,
  isStaff,
};