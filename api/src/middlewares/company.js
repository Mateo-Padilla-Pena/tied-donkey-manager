const { findByFirebaseUid } = require("../modules/users/user.repository");
const { AppError } = require("../lib/AppError");

// Resolves the company of the authenticated user; must run after requireAuth
async function requireCompany(req, _res, next) {
  try {
    const user = await findByFirebaseUid(req.user.uid);
    if (!user?.companyId) {
      throw new AppError(403, "NO_COMPANY", "Tu usuario no pertenece a ninguna empresa");
    }
    req.companyId = user.companyId;
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = { requireCompany };
