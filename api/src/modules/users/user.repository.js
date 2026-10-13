const { getPrisma } = require("../../lib/prisma");

const select = {
  id: true,
  firebaseUid: true,
  email: true,
  fullName: true,
  companyId: true,
  createdAt: true,
  updatedAt: true,
};

// Finds the user linked to a Firebase identity; returns null if it does not exist
async function findByFirebaseUid(firebaseUid) {
  const prisma = getPrisma();
  return prisma.user.findUnique({ where: { firebaseUid }, select });
}

// Creates the user on first login; later calls only refresh the identity email
async function upsertIdentity({ firebaseUid, email }) {
  const prisma = getPrisma();

  return prisma.user.upsert({
    where: { firebaseUid },
    update: { email },
    create: { firebaseUid, email },
    select,
  });
}

// Updates the personal data of the user identified by firebaseUid
async function updateByFirebaseUid(firebaseUid, data) {
  const prisma = getPrisma();

  return prisma.user.update({
    where: { firebaseUid },
    data,
    select,
  });
}

module.exports = { findByFirebaseUid, upsertIdentity, updateByFirebaseUid };
