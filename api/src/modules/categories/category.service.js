const repository = require("./category.repository");
const { AppError } = require("../../lib/AppError");

// Converts the Prisma result into the shape the client receives
function serialize(category) {
  const { _count, ...rest } = category;
  return { ...rest, productCount: _count.products };
}

// Paginated list: asks the repository for the page and builds the metadata
async function list({ q, page, pageSize }) {
  const { total, items } = await repository.findPage({ q, page, pageSize });

  return {
    data: items.map(serialize),
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}

// Looks up a category; responds 404 if it does not exist
async function getById(id) {
  const category = await repository.findById(id);
  if (!category) {
    throw new AppError(404, "NOT_FOUND", "Categoría no encontrada");
  }
  return serialize(category);
}

async function create(data) {
  const category = await repository.create(data);
  return serialize(category);
}

async function update(id, data) {
  const category = await repository.update(id, data);
  return serialize(category);
}

// Checks links first: ProductCategory uses onDelete: Restrict, and Prisma does not always map that error to P2003
async function remove(id) {
  if ((await repository.countProducts(id)) > 0) {
    throw new AppError(
      409,
      "CATEGORY_IN_USE",
      "La categoría tiene productos asociados. Desasóciala antes de eliminarla",
    );
  }
  await repository.remove(id);
}

module.exports = { list, getById, create, update, remove };
