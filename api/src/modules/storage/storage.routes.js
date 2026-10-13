const { Readable } = require("stream");
const { Router } = require("express");
const Joi = require("joi");
const multer = require("multer");
const { requireAuth } = require("../../middlewares/auth");
const { requireCompany } = require("../../middlewares/company");
const { validate } = require("../../middlewares/validate");
const { AppError } = require("../../lib/AppError");
const service = require("./storage.service");
const { TARGETS, MAX_UPLOAD_BYTES, ALLOWED_MIME_TYPES } = require("./storage.config");

// The product is required so the file is stored under products/{productId}/
const uploadQuery = Joi.object({
  productId: Joi.string().uuid().required(),
});

const fileQuery = Joi.object({
  path: Joi.string().trim().max(500).required(),
});

// Keeps the file in memory; it is compressed before it reaches the bucket
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
  // Files with other MIME types are dropped and reported as FILE_REQUIRED below
  fileFilter: (_req, file, cb) => cb(null, ALLOWED_MIME_TYPES.includes(file.mimetype)),
});

// Firebase reads the whole body into req.rawBody and ends the stream before Express,
// so multer must read from that buffer instead of the request
function bodyAsStream(req) {
  if (!req.rawBody) return req;
  const stream = Readable.from([req.rawBody]);
  stream.headers = req.headers;
  return stream;
}

const router = Router();

router.use(requireAuth, requireCompany);

// GET /storage/file?path=... -> image bytes; only paths under the caller's company
router.get("/file", validate(fileQuery, "query"), async (req, res, next) => {
  try {
    const { path } = req.validated.query;
    if (!path.startsWith(`${req.companyId}/`)) {
      throw new AppError(403, "FORBIDDEN_PATH", "La imagen no pertenece a tu empresa");
    }
    const buffer = await service.downloadFile(path);
    res.set("Content-Type", "image/webp");
    res.set("Cache-Control", "private, max-age=3600");
    res.send(buffer);
  } catch (err) {
    // The bucket answers 404 when the object is gone
    if (err?.code === 404) return next(new AppError(404, "NOT_FOUND", "Imagen no encontrada"));
    return next(err);
  }
});

// POST /storage/:target?productId=...  (multipart field "file") -> stores the image and returns its path
router.post(
  "/:target",
  (req, _res, next) => {
    if (!TARGETS[req.params.target]) {
      return next(new AppError(404, "UNKNOWN_TARGET", "Destino de almacenamiento no válido"));
    }
    return next();
  },
  validate(uploadQuery, "query"),
  (req, res, next) => {
    const source = bodyAsStream(req);
    upload.single("file")(source, res, (err) => {
      // multer attaches the file to the object it read from
      req.file = source.file;
      if (err?.code === "LIMIT_FILE_SIZE") {
        return next(new AppError(413, "FILE_TOO_LARGE", "La imagen supera el límite de 10 MB"));
      }
      // Errors without a multer code come from busboy: the body was cut or malformed
      if (err && !err.code) {
        return next(new AppError(400, "INVALID_UPLOAD", "La subida se interrumpió. Intenta de nuevo"));
      }
      return next(err);
    });
  },
  async (req, res, next) => {
    try {
      if (!req.file) {
        throw new AppError(400, "FILE_REQUIRED", 'Envía una imagen válida en el campo "file"');
      }
      const data = await service.uploadImage(req.companyId, req.params.target, req.file.buffer, {
        productId: req.validated.query.productId,
      });
      res.status(201).json({ data });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
