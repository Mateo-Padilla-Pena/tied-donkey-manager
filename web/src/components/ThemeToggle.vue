<template>
  <button class="icon-btn" type="button" :aria-label="label" :title="label" @click="toggle">
    <!-- Sun shown in dark mode (switch to light), moon shown in light mode -->
    <svg v-if="isDark" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
    <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  </button>
</template>

<script>
import { theme, toggleTheme } from "../lib/theme";

export default {
  name: "ThemeToggle",
  computed: {
    isDark() {
      return theme.value === "dark";
    },
    label() {
      return this.isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
    },
  },
  methods: {
    toggle() {
      toggleTheme();
    },
  },
};
</script>
