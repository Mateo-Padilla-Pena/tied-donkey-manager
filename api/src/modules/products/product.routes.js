const { Router } = require("express");
const { requireAuth } = require("../../middlewares/auth");
const { requireCompany } = require("../../middlewares/company");
const { validate } = require("../../middlewares/validate");
const service = require("./product.service");
const schema = require("./product.schema");

const router = Router();

router.use(requireAuth);

router.get("/", validate(schema.listProductsQuery, "query"), async (req, res, next) => {
  try {
    res.json(await service.list(req.validated.query));
  } catch (err) {
    next(err);
  }
});

router.post("/", validate(schema.createProduct), async (req, res, next) => {
  try {
    res.status(201).json({ data: await service.create(req.validated.body) });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", validate(schema.idParams, "params"), async (req, res, next) => {
  try {
    res.json({ data: await service.getById(req.validated.params.id) });
  } catch (err) {
    next(err);
  }
});

router.patch(
  "/:id",
  validate(schema.idParams, "params"),
  validate(schema.updateProduct),
  async (req, res, next) => {
    try {
      res.json({ data: await service.update(req.validated.params.id, req.validated.body) });
    } catch (err) {
      next(err);
    }
  },
);

router.delete("/:id", validate(schema.idParams, "params"), async (req, res, next) => {
  try {
    await service.remove(req.validated.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.post(
  "/:id/images",
  validate(schema.idParams, "params"),
  requireCompany,
  validate(schema.createImage),
  async (req, res, next) => {
    try {
      const image = await service.addImage(req.validated.params.id, req.companyId, req.validated.body);
      res.status(201).json({ data: image });
    } catch (err) {
      next(err);
    }
  },
);

router.delete(
  "/:id/images/:imageId",
  validate(schema.imageParams, "params"),
  async (req, res, next) => {
    try {
      const { id, imageId } = req.validated.params;
      await service.removeImage(id, imageId);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
