const { Router } = require("express");
const { requireAuth } = require("../../middlewares/auth");
const { validate } = require("../../middlewares/validate");
const service = require("./category.service");
const schema = require("./category.schema");

const router = Router();

// All category routes require an authenticated user
router.use(requireAuth);

router.get("/", validate(schema.listCategoriesQuery, "query"), async (req, res, next) => {
  try {
    res.json(await service.list(req.validated.query));
  } catch (err) {
    next(err);
  }
});

router.post("/", validate(schema.createCategory), async (req, res, next) => {
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
  validate(schema.updateCategory),
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

module.exports = router;
