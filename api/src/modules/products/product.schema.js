const Joi = require("joi");

const uuid = Joi.string().uuid();
const text = Joi.string().trim().max(2000).allow("", null);
// Empty codes are dropped (undefined) so they never collide on the unique sku
const code = Joi.string().trim().max(60).empty("").allow(null);

const idParams = Joi.object({
  id: uuid.required(),
});

const imageParams = Joi.object({
  id: uuid.required(),
  imageId: uuid.required(),
});

const createProduct = Joi.object({
  internalName: Joi.string().trim().min(2).max(120).required(),
  publishName: Joi.string().trim().min(2).max(120).required(),
  sku: code,
  providerSku: code,
  supplierPrice: Joi.number().precision(2).min(0).max(9999999999.99).required(),
  supplierId: uuid.required(),
  notes: text,
  details: text,
  categoryIds: Joi.array().items(uuid).unique().default([]),
});

// categoryIds replaces the whole category list when provided
const updateProduct = Joi.object({
  internalName: Joi.string().trim().min(2).max(120),
  publishName: Joi.string().trim().min(2).max(120),
  sku: code,
  providerSku: code,
  supplierPrice: Joi.number().precision(2).min(0).max(9999999999.99),
  supplierId: uuid,
  notes: text,
  details: text,
  categoryIds: Joi.array().items(uuid).unique(),
}).min(1);

const listProductsQuery = Joi.object({
  q: Joi.string().trim().max(120).allow(""),
  supplierId: uuid,
  categoryId: uuid,
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(20),
});

// Only metadata: the file was already uploaded through /storage/productImages
// The path prefix (companyId/products/{productId}/productImages/) is checked in the service
const createImage = Joi.object({
  storagePath: Joi.string().trim().max(500).pattern(/\.webp$/).required(),
  contentType: Joi.string().valid("image/webp").required(),
  sizeBytes: Joi.number().integer().min(1).max(10 * 1024 * 1024).required(),
  sortOrder: Joi.number().integer().min(0).default(0),
});

module.exports = {
  idParams,
  imageParams,
  createProduct,
  updateProduct,
  listProductsQuery,
  createImage,
};
