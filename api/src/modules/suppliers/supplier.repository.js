const { getPrisma } = require("../../lib/prisma");

const select = {
  id: true,
  name: true,
  location: true,
  commercialContext: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { products: true } },
};

// Case-insensitive name filter for the search query
function buildWhere(q) {
  return q ? { name: { contains: q, mode: "insensitive" } } : {};
}

async function findPage({ q, page, pageSize }) {
  const prisma = getPrisma();
  const where = buildWhere(q);

  const [total, items] = await Promise.all([
    prisma.supplier.count({ where }),
    prisma.supplier.findMany({
      where,
      select,
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return { total, items };
}

async function findById(id) {
  const prisma = getPrisma();
  return prisma.supplier.findUnique({ where: { id }, select });
}

async function create(data) {
  const prisma = getPrisma();
  return prisma.supplier.create({ data, select });
}

async function update(id, data) {
  const prisma = getPrisma();
  return prisma.supplier.update({ where: { id }, data, select });
}

// Deletes the supplier with all its products in one transaction (their category links and image rows cascade)
// Returns the storage paths of the removed images so the caller can delete the files
async function removeWithProducts(id) {
  const prisma = getPrisma();

  return prisma.$transaction(async (tx) => {
    const images = await tx.productImage.findMany({
      where: { product: { supplierId: id } },
      select: { storagePath: true },
    });
    await tx.product.deleteMany({ where: { supplierId: id } });
    await tx.supplier.delete({ where: { id } });
    return images.map((image) => image.storagePath);
  });
}

module.exports = { findPage, findById, create, update, removeWithProducts };
