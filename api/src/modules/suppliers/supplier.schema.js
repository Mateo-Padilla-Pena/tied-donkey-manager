const Joi = require("joi");

const name = Joi.string().trim().min(2).max(120);

const idParams = Joi.object({
  id: Joi.string().uuid().required(),
});

const createSupplier = Joi.object({
  name: name.required(),
  location: Joi.string().trim().max(200).allow("", null),
  commercialContext: Joi.string().trim().max(2000).allow("", null),
});

const updateSupplier = Joi.object({
  name,
  location: Joi.string().trim().max(200).allow("", null),
  commercialContext: Joi.string().trim().max(2000).allow("", null),
}).min(1);

const listSuppliersQuery = Joi.object({
  q: Joi.string().trim().max(120).allow(""),
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(20),
});

module.exports = { idParams, createSupplier, updateSupplier, listSuppliersQuery };
