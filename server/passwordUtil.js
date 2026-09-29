// The HOD's rule for a brand-new account: the password starts out as the
// person's name, lowercased, with spaces removed. Used both by seed.js
// (starting accounts) and userRoutes.js (accounts the HOD registers later),
// so the rule only lives in one place.
function defaultPasswordFor(name) {
  return name.toLowerCase().replace(/\s+/g, "");
}

module.exports = { defaultPasswordFor };
