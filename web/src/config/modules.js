import { mdiShapeOutline, mdiTruckDeliveryOutline, mdiPackageVariantClosed, mdiAccountCircleOutline } from "@mdi/js";

// Endpoints used to load select options (filters and form fields)
export const sources = {
  categories: { endpoint: "/categories" },
  suppliers: { endpoint: "/suppliers" },
};

// Each module drives the generic table, filters and form.
// Column: key (dot path), label, format (date | money | chips), truncate
// Field: key, label, type (text | textarea | number | select | multiselect), required, source, from (maps the record to the form value)
// Filter: key, label, source (rendered as a select)
// Array order is the sidebar order
export const modules = [
  {
    key: "products",
    label: "Productos",
    path: "/productos",
    icon: mdiPackageVariantClosed,
    endpoint: "/products",
    // Enables the image panel in the form; images are uploaded to this storage target
    images: { target: "productImages" },
    searchable: true,
    searchPlaceholder: "Buscar por nombre interno o de publicación",
    filters: [
      { key: "categoryId", label: "Categoría", source: "categories" },
      { key: "supplierId", label: "Proveedor", source: "suppliers" },
    ],
    columns: [
      { key: "images", label: "Imagen", format: "image" },
      { key: "internalName", label: "Nombre interno" },
      { key: "publishName", label: "Nombre de publicación" },
      { key: "sku", label: "SKU" },
      { key: "providerSku", label: "SKU proveedor" },
      { key: "supplier.name", label: "Proveedor" },
      { key: "supplierPrice", label: "Precio proveedor", format: "money" },
      { key: "categories", label: "Categorías", format: "chips" },
      { key: "notes", label: "Notas", truncate: true },
      { key: "details", label: "Detalles", truncate: true },
      { key: "updatedAt", label: "Actualizado", format: "date" },
    ],
    fields: [
      { key: "internalName", label: "Nombre interno", type: "text", required: true },
      { key: "publishName", label: "Nombre de publicación", type: "text", required: true },
      { key: "sku", label: "SKU", type: "text" },
      { key: "providerSku", label: "SKU proveedor", type: "text" },
      {
        key: "supplierId",
        label: "Proveedor",
        type: "select",
        source: "suppliers",
        required: true,
        from: (r) => r.supplier?.id,
      },
      { key: "supplierPrice", label: "Precio proveedor", type: "number", step: "0.01", min: 0, required: true },
      {
        key: "categoryIds",
        label: "Categorías",
        type: "multiselect",
        source: "categories",
        from: (r) => (r.categories ?? []).map((c) => c.id),
      },
      { key: "notes", label: "Notas", type: "textarea" },
      { key: "details", label: "Detalles", type: "textarea" },
    ],
  },
  {
    key: "suppliers",
    label: "Proveedores",
    path: "/proveedores",
    icon: mdiTruckDeliveryOutline,
    endpoint: "/suppliers",
    // Extra sentence in the delete confirmation: deleting a supplier also deletes its products
    deleteNote: "También se eliminarán todos sus productos y sus imágenes.",
    searchable: true,
    searchPlaceholder: "Buscar por nombre",
    filters: [],
    columns: [
      { key: "name", label: "Nombre" },
      { key: "location", label: "Ubicación" },
      { key: "commercialContext", label: "Contexto comercial", truncate: true },
      { key: "productCount", label: "Productos" },
      { key: "updatedAt", label: "Actualizado", format: "date" },
    ],
    fields: [
      { key: "name", label: "Nombre", type: "text", required: true },
      { key: "location", label: "Ubicación", type: "text" },
      { key: "commercialContext", label: "Contexto comercial", type: "textarea" },
    ],
  },
  {
    key: "categories",
    label: "Categorías",
    path: "/categorias",
    icon: mdiShapeOutline,
    endpoint: "/categories",
    searchable: true,
    searchPlaceholder: "Buscar por nombre",
    filters: [],
    columns: [
      { key: "name", label: "Nombre" },
      { key: "productCount", label: "Productos" },
      { key: "updatedAt", label: "Actualizado", format: "date" },
    ],
    fields: [{ key: "name", label: "Nombre", type: "text", required: true }],
  },
];

export const profileIcon = mdiAccountCircleOutline;

export const getModule = (key) => modules.find((m) => m.key === key);
