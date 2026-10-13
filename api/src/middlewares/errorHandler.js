const { AppError } = require("../lib/AppError");

// Prisma error codes mapped to HTTP responses
const PRISMA_ERRORS = {
  P2002: { status: 409, code: "CONFLICT", message: "Ya existe un registro con ese valor único" },
  P2003: { status: 409, code: "RELATION_CONFLICT", message: "El registro tiene relaciones asociadas" },
  P2025: { status: 404, code: "NOT_FOUND", message: "Registro no encontrado" },
};

function notFound(req, _res, next) {
  next(new AppError(404, "ROUTE_NOT_FOUND", `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details ?? null },
    });
  }

  if (err?.code && PRISMA_ERRORS[err.code]) {
    const mapped = PRISMA_ERRORS[err.code];
    return res.status(mapped.status).json({
      error: { code: mapped.code, message: mapped.message, details: null },
    });
  }

  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({
      error: { code: "INVALID_JSON", message: "El cuerpo de la petición no es JSON válido", details: null },
    });
  }

  console.error("Error no controlado:", err);
  return res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Error interno del servidor", details: null },
  });
}

module.exports = { errorHandler, notFound };
