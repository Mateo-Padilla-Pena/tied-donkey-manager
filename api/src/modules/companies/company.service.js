const repository = require("./company.repository");
const { AppError } = require("../../lib/AppError");

// Validates that the company id exists; used by clients to check a company
async function getById(id) {
  const company = await repository.findById(id);
  if (!company) {
    throw new AppError(404, "NOT_FOUND", "Compañía no encontrada");
  }
  return company;
}

module.exports = { getById };
