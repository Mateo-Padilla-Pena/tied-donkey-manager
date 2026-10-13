<template>
  <RouterView v-if="$route.meta.public" />

  <div v-else class="layout">
    <AppSidebar />

    <div class="workspace">
      <header class="app-header">
        <div class="session-info">
          <span class="muted">Sesión iniciada como:</span>
          <strong>{{ displayName }}</strong>
        </div>
        <ThemeToggle />
      </header>

      <main class="content">
        <!-- Keyed by path so each module remounts with its own state -->
        <RouterView :key="$route.fullPath" />
      </main>
    </div>
  </div>

  <AppNotifier />
</template>

<script>
import { watch } from "vue";
import AppSidebar from "./components/AppSidebar.vue";
import AppNotifier from "./components/AppNotifier.vue";
import ThemeToggle from "./components/ThemeToggle.vue";
import { currentUser } from "./lib/auth";
import { displayName, loadProfile, profile } from "./lib/session";

export default {
  name: "App",
  components: { AppSidebar, AppNotifier, ThemeToggle },
  computed: {
    displayName() {
      return displayName.value;
    },
  },
  created() {
    // Loads the profile once a user is signed in, and clears it on sign out
    watch(
      currentUser,
      (user) => {
        if (user) loadProfile();
        else profile.value = null;
      },
      { immediate: true },
    );
  },
};
</script>
