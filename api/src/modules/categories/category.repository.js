const { getPrisma } = require("../../lib/prisma");

// Fields Prisma returns for each category, including the product count
const select = {
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { products: true } },
};

// Case-insensitive name filter for the search query
function buildWhere(q) {
  return q ? { name: { contains: q, mode: "insensitive" } } : {};
}

// Fetches one page of categories and the total number of matches
async function findPage({ q, page, pageSize }) {
  const prisma = getPrisma();
  const where = buildWhere(q);

  const [total, items] = await Promise.all([
    prisma.category.count({ where }),
    prisma.category.findMany({
      where,
      select,
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return { total, items };
}

// Finds a category by id; returns null if it does not exist
async function findById(id) {
  const prisma = getPrisma();

  const category = await prisma.category.findUnique({
    where: { id },
    select,
  });

  return category;
}

// Inserts a new category and returns the created record
async function create(data) {
  const prisma = getPrisma();

  const category = await prisma.category.create({
    data,
    select,
  });

  return category;
}

// Updates the provided fields of an existing category
// If the id does not exist, Prisma throws P2025 and errorHandler responds 404
async function update(id, data) {
  const prisma = getPrisma();

  const category = await prisma.category.update({
    where: { id },
    data,
    select,
  });

  return category;
}

// Counts the products linked to the category through ProductCategory
async function countProducts(id) {
  const prisma = getPrisma();
  return prisma.productCategory.count({ where: { categoryId: id } });
}

// Deletes the category by id
async function remove(id) {
  const prisma = getPrisma();

  await prisma.category.delete({
    where: { id },
  });
}

module.exports = { findPage, findById, create, update, countProducts, remove };
