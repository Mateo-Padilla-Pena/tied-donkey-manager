import { getIdToken } from "./auth";

// In production Hosting rewrites /api to the function; in dev Vite proxies it
const BASE = "/api";

// Fallback messages when the API does not send its own
const STATUS_MESSAGES = {
  0: "Sin conexión con el servidor",
  401: "Tu sesión expiró. Vuelve a iniciar sesión",
  403: "No tienes permiso para esta acción",
  404: "No se encontró lo que buscabas",
  409: "La operación entra en conflicto con otros datos",
};

export class ApiError extends Error {
  constructor(status, body) {
    const details = body?.error?.details?.map((d) => d.message).join(". ");
    const fallback =
      STATUS_MESSAGES[status] ??
      (status >= 500 ? "Error del servidor. Intenta más tarde" : `Error ${status}`);
    super([body?.error?.message || fallback, details].filter(Boolean).join(": "));
    this.status = status;
    this.code = body?.error?.code;
  }
}

async function request(method, path, { body, query, form } = {}) {
  const url = new URL(BASE + path, window.location.origin);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  }

  const token = await getIdToken();

  let res;
  try {
    res = await fetch(url, {
      method,
      // FormData sets its own multipart boundary, so no Content-Type is sent for it
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: form ?? (body ? JSON.stringify(body) : undefined),
    });
  } catch {
    // fetch only throws when the request never got a response (offline, DNS, CORS)
    throw new ApiError(0, null);
  }

  if (res.status === 204) return null;

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    // Non-JSON errors (e.g. a 404 from the emulator) get the URL so the cause is visible
    const fallback = {
      error: {
        message: `Respuesta ${res.status} desde ${url.origin}${url.pathname}. Revisa que la API esté corriendo y VITE_API_PROXY_TARGET`,
      },
    };
    throw new ApiError(res.status, json ?? fallback);
  }

  // A 200 without JSON means /api did not reach the API (e.g. Vite served index.html)
  if (json === null) {
    throw new ApiError(res.status, {
      error: {
        message: `La URL ${url.origin} respondió HTML en lugar de JSON. Revisa VITE_API_PROXY_TARGET en web/.env`,
      },
    });
  }
  return json;
}

// Downloads one stored image as a Blob; <img> cannot send the Authorization header itself
export async function fetchImageBlob(storagePath) {
  const token = await getIdToken();
  const url = new URL(`${BASE}/storage/file`, window.location.origin);
  url.searchParams.set("path", storagePath);

  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new ApiError(res.status, null);
  return res.blob();
}

export const api = {
  list: (endpoint, query) => request("GET", endpoint, { query }),
  create: (endpoint, body) => request("POST", endpoint, { body }),
  update: (endpoint, id, body) => request("PATCH", `${endpoint}/${id}`, { body }),
  remove: (endpoint, id) => request("DELETE", `${endpoint}/${id}`),
  me: () => request("GET", "/users/me"),
  updateMe: (body) => request("PATCH", "/users/me", { body }),

  // Uploads one image to /storage/:target for a product; returns { data: { storagePath, contentType, sizeBytes } }
  uploadImage: (target, file, productId) => {
    const form = new FormData();
    form.append("file", file);
    return request("POST", `/storage/${target}`, { form, query: { productId } });
  },
  addProductImage: (productId, body) => request("POST", `/products/${productId}/images`, { body }),
  removeProductImage: (productId, imageId) =>
    request("DELETE", `/products/${productId}/images/${imageId}`),
};
