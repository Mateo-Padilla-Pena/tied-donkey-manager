const repository = require("./user.repository");

// Returns the profile of the authenticated user, creating it on first login
async function getMe({ uid, email }) {
  return repository.upsertIdentity({ firebaseUid: uid, email });
}

async function updateMe(uid, data) {
  return repository.updateByFirebaseUid(uid, data);
}

module.exports = { getMe, updateMe };
