const { AppError } = require("../lib/AppError");

// Validates one part of the request ("body", "query" or "params") with a Joi schema
function validate(schema, source = "body") {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join("."),
        message: d.message,
      }));
      return next(new AppError(400, "VALIDATION_ERROR", "Datos inválidos", details));
    }

    // Express 5 exposes req.query as a getter, so validated data is stored separately
    req.validated = { ...req.validated, [source]: value };
    return next();
  };
}

module.exports = { validate };
