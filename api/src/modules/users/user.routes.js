const { Router } = require("express");
const { requireAuth } = require("../../middlewares/auth");
const { validate } = require("../../middlewares/validate");
const service = require("./user.service");
const schema = require("./user.schema");

const router = Router();

router.use(requireAuth);

// Profile of the logged-in user (created on first call)
router.get("/me", async (req, res, next) => {
  try {
    res.json({ data: await service.getMe(req.user) });
  } catch (err) {
    next(err);
  }
});

router.patch("/me", validate(schema.updateProfile), async (req, res, next) => {
  try {
    res.json({ data: await service.updateMe(req.user.uid, req.validated.body) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
