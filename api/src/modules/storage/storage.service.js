const { randomUUID } = require("crypto");
const sharp = require("sharp");
const { getStorage } = require("firebase-admin/storage");
const { AppError } = require("../../lib/AppError");
const { BUCKET, TARGETS } = require("./storage.config");

// Resolved lazily so the Admin SDK is initialized before the first call
const bucket = () => getStorage().bucket(BUCKET);

// Converts to WebP, scales down to the target size and stores it under companyId/folder/
async function uploadImage(companyId, target, buffer, scope) {
  const cfg = TARGETS[target];

  let output;
  try {
    output = await sharp(buffer)
      .rotate() // applies EXIF orientation before resizing
      .resize({ width: cfg.maxWidth, height: cfg.maxHeight, fit: "inside", withoutEnlargement: true })
      .webp({ quality: cfg.quality })
      .toBuffer({ resolveWithObject: true });
  } catch {
    throw new AppError(400, "INVALID_IMAGE", "El archivo no es una imagen válida");
  }

  const storagePath = `${companyId}/${cfg.folder(scope)}/${randomUUID()}.webp`;
  await bucket()
    .file(storagePath)
    .save(output.data, {
      contentType: "image/webp",
      resumable: false,
      metadata: { cacheControl: "public, max-age=31536000" },
    });

  return {
    storagePath,
    contentType: "image/webp",
    sizeBytes: output.info.size,
    width: output.info.width,
    height: output.info.height,
  };
}

// Best effort: a failed delete is logged, not returned to the client
async function deleteFile(storagePath) {
  try {
    await bucket().file(storagePath).delete({ ignoreNotFound: true });
  } catch (err) {
    console.error("No se pudo borrar el archivo", storagePath, err);
  }
}

// Reads the bytes with the Admin SDK; the API streams them, so no signed URL is needed
async function downloadFile(storagePath) {
  const [buffer] = await bucket().file(storagePath).download();
  return buffer;
}

module.exports = { uploadImage, deleteFile, downloadFile };
