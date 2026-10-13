const { Router } = require("express");
const Joi = require("joi");
const { requireAuth } = require("../../middlewares/auth");
const { validate } = require("../../middlewares/validate");
const service = require("./company.service");

const idParams = Joi.object({
  id: Joi.string().uuid().required(),
});

const router = Router();

router.use(requireAuth);

// Read-only: companies are created and assigned outside the API
router.get("/:id", validate(idParams, "params"), async (req, res, next) => {
  try {
    res.json({ data: await service.getById(req.validated.params.id) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
