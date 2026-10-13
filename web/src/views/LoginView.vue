<template>
  <main class="login">
    <ThemeToggle class="theme-toggle" />

    <v-card class="login-card" width="380">
      <v-card-text class="pa-8">
        <div class="login-brand">
          <img src="/logo.png" alt="Logo Tied Donkey" class="login-logo" />
          <h1>Tied Donkey</h1>
          <p class="muted">Inicia sesión para continuar</p>
        </div>

        <v-form class="mt-6" @submit.prevent="login">
          <v-text-field
            v-model="email"
            label="Correo"
            type="email"
            autocomplete="email"
            required
          />
          <v-text-field
            v-model="password"
            label="Contraseña"
            type="password"
            autocomplete="current-password"
            required
          />

          <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>

          <v-btn color="primary" variant="flat" size="large" block type="submit" :loading="loading">
            Entrar
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </main>
</template>

<script>
import ThemeToggle from "../components/ThemeToggle.vue";
import { loginWithEmail } from "../lib/auth";

// Firebase error codes mapped to Spanish messages
const MESSAGES = {
  "auth/invalid-credential": "Correo o contraseña incorrectos",
  "auth/user-not-found": "Correo o contraseña incorrectos",
  "auth/wrong-password": "Correo o contraseña incorrectos",
  "auth/invalid-email": "El correo no es válido",
  "auth/too-many-requests": "Demasiados intentos. Intenta más tarde",
  "auth/network-request-failed": "Sin conexión. Revisa tu internet",
};

export default {
  name: "LoginView",
  components: { ThemeToggle },
  data() {
    return { email: "", password: "", error: "", loading: false };
  },
  methods: {
    async login() {
      this.loading = true;
      this.error = "";
      try {
        await loginWithEmail(this.email.trim(), this.password);
        this.$router.push("/");
      } catch (err) {
        this.error = MESSAGES[err.code] ?? "No se pudo iniciar sesión";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
