const { auth } = require("../lib/firebase");
const { AppError } = require("../lib/AppError");

// Verifies the Firebase ID token sent as "Authorization: Bearer <token>"
async function requireAuth(req, _res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(new AppError(401, "UNAUTHENTICATED", "Token de autenticación requerido"));
  }

  try {
    const decoded = await auth().verifyIdToken(token);
    req.user = { uid: decoded.uid, email: decoded.email ?? null };
    return next();
  } catch {
    return next(new AppError(401, "INVALID_TOKEN", "Token inválido o expirado"));
  }
}

module.exports = { requireAuth };
