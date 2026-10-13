const { Router } = require("express");
const categoryRoutes = require("../modules/categories/category.routes");
const supplierRoutes = require("../modules/suppliers/supplier.routes");
const productRoutes = require("../modules/products/product.routes");
const userRoutes = require("../modules/users/user.routes");
const storageRoutes = require("../modules/storage/storage.routes");
const companyRoutes = require("../modules/companies/company.routes");

const router = Router();

// Public: used to check that the function is up
router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/suppliers", supplierRoutes);
router.use("/products", productRoutes);
router.use("/storage", storageRoutes);
router.use("/companies", companyRoutes);

module.exports = router;
