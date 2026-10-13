import { ref, watch } from "vue";

const saved = localStorage.getItem("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

export const theme = ref(saved ?? (prefersDark ? "dark" : "light"));

// Applies the theme to <html> so the CSS variables switch
watch(
  theme,
  (value) => {
    document.documentElement.dataset.theme = value;
    localStorage.setItem("theme", value);
  },
  { immediate: true },
);

export const toggleTheme = () => {
  theme.value = theme.value === "dark" ? "light" : "dark";
};
