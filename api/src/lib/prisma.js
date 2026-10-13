const { PrismaClient } = require("@prisma/client");

// Per-instance singleton: avoids opening a new connection pool on every invocation
let prisma;

function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

module.exports = { getPrisma };
