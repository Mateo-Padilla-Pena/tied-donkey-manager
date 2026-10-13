const repository = require("./product.repository");
const storage = require("../storage/storage.service");
const { TARGETS } = require("../storage/storage.config");
const { AppError } = require("../../lib/AppError");

// Flattens the join rows; images keep storagePath so the client can fetch the bytes
function serialize(product) {
  const { categories, ...rest } = product;
  return {
    ...rest,
    categories: categories.map((c) => c.category),
  };
}

// Maps a missing supplier or category (P2003 on write) to a 400 instead of a 409
function rethrowInvalidReference(err) {
  if (err?.code === "P2003") {
    throw new AppError(400, "INVALID_REFERENCE", "El proveedor o alguna categoría no existe");
  }
  throw err;
}

async function list({ q, supplierId, categoryId, page, pageSize }) {
  const { total, items } = await repository.findPage({
    q,
    supplierId,
    categoryId,
    page,
    pageSize,
  });

  return {
    data: await Promise.all(items.map(serialize)),
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}

async function getById(id) {
  const product = await repository.findById(id);
  if (!product) {
    throw new AppError(404, "NOT_FOUND", "Producto no encontrado");
  }
  return serialize(product);
}

async function create(data) {
  try {
    return await serialize(await repository.create(data));
  } catch (err) {
    return rethrowInvalidReference(err);
  }
}

async function update(id, data) {
  try {
    return await serialize(await repository.update(id, data));
  } catch (err) {
    return rethrowInvalidReference(err);
  }
}

// Deletes the product rows first, then the files; files are not orphaned on success
async function remove(id) {
  const product = await repository.findById(id);
  if (!product) {
    throw new AppError(404, "NOT_FOUND", "Producto no encontrado");
  }

  await repository.remove(id);
  await Promise.all(product.images.map((image) => storage.deleteFile(image.storagePath)));
}

// Checks the product exists first so the image insert never hits a foreign key error;
// the file must live under the caller's company and under this product
async function addImage(productId, companyId, data) {
  const prefix = `${companyId}/${TARGETS.productImages.folder({ productId })}/`;
  if (!data.storagePath.startsWith(prefix)) {
    throw new AppError(400, "INVALID_IMAGE_PATH", "La imagen no pertenece a tu empresa");
  }
  const product = await repository.findById(productId);
  if (!product) {
    throw new AppError(404, "NOT_FOUND", "Producto no encontrado");
  }
  return repository.createImage(productId, data);
}

// Removes the row and then the file in the bucket
async function removeImage(productId, imageId) {
  const image = await repository.findImage(productId, imageId);
  if (!image) {
    throw new AppError(404, "NOT_FOUND", "Imagen no encontrada");
  }

  await repository.removeImage(productId, imageId);
  await storage.deleteFile(image.storagePath);
}

module.exports = { list, getById, create, update, remove, addImage, removeImage };
