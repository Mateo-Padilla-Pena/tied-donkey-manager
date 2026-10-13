const repository = require("./supplier.repository");
const storage = require("../storage/storage.service");
const { AppError } = require("../../lib/AppError");

// Converts the Prisma result into the shape the client receives
function serialize(supplier) {
  const { _count, ...rest } = supplier;
  return { ...rest, productCount: _count.products };
}

async function list({ q, page, pageSize }) {
  const { total, items } = await repository.findPage({ q, page, pageSize });

  return {
    data: items.map(serialize),
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}

async function getById(id) {
  const supplier = await repository.findById(id);
  if (!supplier) {
    throw new AppError(404, "NOT_FOUND", "Proveedor no encontrado");
  }
  return serialize(supplier);
}

async function create(data) {
  return serialize(await repository.create(data));
}

async function update(id, data) {
  return serialize(await repository.update(id, data));
}

// Deletes the supplier and its products; the image files are removed from the bucket afterwards
async function remove(id) {
  const storagePaths = await repository.removeWithProducts(id);
  await Promise.all(storagePaths.map((path) => storage.deleteFile(path)));
}

module.exports = { list, getById, create, update, remove };
