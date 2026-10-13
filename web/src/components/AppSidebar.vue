<template>
  <aside class="sidebar">
    <div class="brand">
      <img src="/logo.png" alt="Logo Tied Donkey" class="brand-logo" />
      <span>Tied Donkey</span>
    </div>

    <nav>
      <router-link v-for="m in modules" :key="m.key" :to="m.path" class="nav-link">
        <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path :d="m.icon" fill="currentColor" /></svg>
        <span>{{ m.label }}</span>
      </router-link>
      <router-link to="/perfil" class="nav-link">
        <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path :d="profileIcon" fill="currentColor" /></svg>
        <span>Mi perfil</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <v-btn
        class="logout-btn"
        color="error"
        variant="tonal"
        block
        @click="signOutUser"
      >
        Cerrar sesión
      </v-btn>
    </div>
  </aside>
</template>

<script>
import { logout } from "../lib/auth";
import { modules, profileIcon } from "../config/modules";

export default {
  name: "AppSidebar",
  data() {
    return { modules, profileIcon };
  },
  methods: {
    async signOutUser() {
      await logout();
      this.$router.push("/login");
    },
  },
};
</script>
