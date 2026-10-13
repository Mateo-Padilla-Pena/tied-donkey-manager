const { getPrisma } = require("../../lib/prisma");

const select = {
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true,
};

// Returns null if the company does not exist
async function findById(id) {
  const prisma = getPrisma();
  return prisma.company.findUnique({ where: { id }, select });
}

module.exports = { findById };
