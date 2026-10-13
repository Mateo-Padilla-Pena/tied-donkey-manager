const { getPrisma } = require("../../lib/prisma");

const select = {
  id: true,
  internalName: true,
  publishName: true,
  sku: true,
  providerSku: true,
  supplierPrice: true,
  notes: true,
  details: true,
  createdAt: true,
  updatedAt: true,
  supplier: { select: { id: true, name: true } },
  categories: { select: { category: { select: { id: true, name: true } } } },
  images: {
    select: {
      id: true,
      storagePath: true,
      contentType: true,
      sizeBytes: true,
      sortOrder: true,
      createdAt: true,
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  },
};

// Builds the filters: text search on both names, plus optional supplier and category
function buildWhere({ q, supplierId, categoryId }) {
  const where = {};

  if (q) {
    where.OR = [
      { internalName: { contains: q, mode: "insensitive" } },
      { publishName: { contains: q, mode: "insensitive" } },
    ];
  }
  if (supplierId) where.supplierId = supplierId;
  if (categoryId) where.categories = { some: { categoryId } };

  return where;
}

async function findPage({ page, pageSize, ...filters }) {
  const prisma = getPrisma();
  const where = buildWhere(filters);

  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      select,
      orderBy: { internalName: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return { total, items };
}

async function findById(id) {
  const prisma = getPrisma();
  return prisma.product.findUnique({ where: { id }, select });
}

// Creates the product and its category links in one nested write
async function create({ categoryIds, ...data }) {
  const prisma = getPrisma();

  return prisma.product.create({
    data: {
      ...data,
      categories: { create: categoryIds.map((categoryId) => ({ categoryId })) },
    },
    select,
  });
}

// When categoryIds is given, the existing links are replaced
async function update(id, { categoryIds, ...data }) {
  const prisma = getPrisma();

  return prisma.product.update({
    where: { id },
    data: {
      ...data,
      ...(categoryIds && {
        categories: {
          deleteMany: {},
          create: categoryIds.map((categoryId) => ({ categoryId })),
        },
      }),
    },
    select,
  });
}

// Deletes the product; its category links and images cascade in the database
async function remove(id) {
  const prisma = getPrisma();
  await prisma.product.delete({ where: { id } });
}

async function createImage(productId, data) {
  const prisma = getPrisma();

  return prisma.productImage.create({
    data: { productId, ...data },
    select: {
      id: true,
      storagePath: true,
      contentType: true,
      sizeBytes: true,
      sortOrder: true,
      createdAt: true,
    },
  });
}

// Returns the image row (with its storage path) or null if it does not belong to the product
async function findImage(productId, imageId) {
  const prisma = getPrisma();
  return prisma.productImage.findFirst({
    where: { id: imageId, productId },
    select: { id: true, storagePath: true },
  });
}

// Returns the number of deleted rows so the service can respond 404 when 0
async function removeImage(productId, imageId) {
  const prisma = getPrisma();
  const { count } = await prisma.productImage.deleteMany({
    where: { id: imageId, productId },
  });
  return count;
}

module.exports = {
  findPage,
  findById,
  create,
  update,
  remove,
  createImage,
  findImage,
  removeImage,
};
