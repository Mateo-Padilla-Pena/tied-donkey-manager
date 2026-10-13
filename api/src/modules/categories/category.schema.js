const Joi = require("joi");

const name = Joi.string().trim().min(2).max(80);

const idParams = Joi.object({
  id: Joi.string().uuid().required(),
});

const createCategory = Joi.object({
  name: name.required(),
});

const updateCategory = Joi.object({
  name,
}).min(1);

const listCategoriesQuery = Joi.object({
  q: Joi.string().trim().max(80).allow(""),
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(20),
});

module.exports = { idParams, createCategory, updateCategory, listCategoriesQuery };
