// Reads a nested value, e.g. getPath(row, "supplier.name")
export const getPath = (obj, path) => path.split(".").reduce((o, k) => o?.[k], obj);

export const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

export const formatMoney = (value) =>
  value === null || value === undefined || value === ""
    ? "—"
    : Number(value).toLocaleString("es", { minimumFractionDigits: 2, maximumFractionDigits: 2 });