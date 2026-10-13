import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target = env.VITE_API_PROXY_TARGET;

  return {
    plugins: [
      vue(),
      // Imports only the Vuetify components used in templates
      vuetify({ autoImport: true }),
    ],
    server: target
      ? {
          // Forwards /api to the deployed function (or the emulator) to avoid CORS in dev
          proxy: {
            "/api": {
              target,
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/api/, ""),
            },
          },
        }
      : {},
  };
});
