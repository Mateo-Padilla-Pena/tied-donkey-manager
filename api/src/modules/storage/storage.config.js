// Files are stored as {companyId}/{folder}/{uuid}.webp; companyId comes from the user
const BUCKET = "tied-donkey-manager.firebasestorage.app";

// Each upload target has a standard size: larger images are scaled down, never up
// folder receives the scope (e.g. { productId }) and returns the path inside the company
const TARGETS = {
  productImages: {
    folder: ({ productId }) => `products/${productId}/productImages`,
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 80,
  },
};

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

module.exports = {
  BUCKET,
  TARGETS,
  MAX_UPLOAD_BYTES,
  ALLOWED_MIME_TYPES,
};
