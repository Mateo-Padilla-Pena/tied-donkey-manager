import { reactive } from "vue";
import { ApiError } from "./api";

// Global notice shown by AppNotifier; one at a time, the newest replaces the old
export const notice = reactive({ visible: false, message: "", color: "error" });

let timer = null;

export function notify(message, color = "error", timeout = 5000) {
  notice.message = message;
  notice.color = color;
  notice.visible = true;
  clearTimeout(timer);
  timer = setTimeout(() => {
    notice.visible = false;
  }, timeout);
}

// Known API errors show their server message; anything else gets a generic one
export function notifyError(err) {
  const message =
    err instanceof ApiError ? err.message : "Ocurrió un error inesperado. Intenta de nuevo";
  notify(message);
}
