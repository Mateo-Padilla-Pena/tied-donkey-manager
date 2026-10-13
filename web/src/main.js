import { createApp, watch } from "vue";
import App from "./App.vue";
import router from "./router";
import { vuetify } from "./lib/vuetify";
import { theme } from "./lib/theme";
import { notifyError } from "./lib/notify";
import "./style.css";

const app = createApp(App);

// Errors thrown during rendering, watchers and event handlers
app.config.errorHandler = (err) => {
  console.error(err);
  notifyError(err);
};

// Async errors that no component caught (e.g. a promise without catch)
window.addEventListener("unhandledrejection", (event) => {
  console.error(event.reason);
  notifyError(event.reason);
});

app.use(vuetify).use(router);

// Keeps Vuetify components in sync with the app theme toggle
vuetify.theme.global.name.value = theme.value;
watch(theme, (value) => {
  vuetify.theme.global.name.value = value;
});

app.mount("#app");
