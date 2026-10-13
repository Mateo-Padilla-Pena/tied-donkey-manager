import "vuetify/styles";
import { createVuetify } from "vuetify";

// Black and white base with a blue accent; the grey is only used for subtle details
// Components are imported automatically by vite-plugin-vuetify
export const vuetify = createVuetify({
  theme: {
    defaultTheme: "light",
    themes: {
      light: {
        dark: false,
        colors: {
          background: "#ffffff",
          surface: "#ffffff",
          primary: "#2563eb",
          secondary: "#111111",
          error: "#dc2626",
          success: "#16a34a",
        },
      },
      dark: {
        dark: true,
        colors: {
          background: "#000000",
          surface: "#0a0a0a",
          primary: "#3b82f6",
          secondary: "#ffffff",
          error: "#ef4444",
          success: "#22c55e",
        },
      },
    },
  },
  defaults: {
    VBtn: { rounded: "xl", elevation: 0 },
    VCard: { rounded: "xl", elevation: 0, border: true },
    VAlert: { rounded: "xl" },
    VChip: { rounded: "pill" },
    VTextField: { variant: "outlined", density: "comfortable", color: "primary", rounded: "xl" },
    VTextarea: { variant: "outlined", density: "comfortable", color: "primary", rounded: "xl" },
    VSelect: { variant: "outlined", density: "comfortable", color: "primary", rounded: "xl" },
  },
});
