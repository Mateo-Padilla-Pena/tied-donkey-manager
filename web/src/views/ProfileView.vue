<template>
  <section>
    <header class="page-header">
      <div>
        <h1>Mi perfil</h1>
        <p class="muted">{{ email }}</p>
      </div>
    </header>

    <v-progress-linear v-if="loading" indeterminate color="primary" />

    <v-card v-else max-width="560">
      <v-form @submit.prevent="save">
        <v-card-text>
          <v-text-field v-for="f in FIELDS" :key="f.key" v-model="form[f.key]" :label="f.label" />

          <v-btn color="primary" variant="flat" type="submit" :loading="saving">Guardar</v-btn>

          <v-alert v-if="error" type="error" variant="tonal" class="mt-4">{{ error }}</v-alert>
          <v-alert v-if="success" type="success" variant="tonal" class="mt-4">{{ success }}</v-alert>
        </v-card-text>
      </v-form>
    </v-card>
  </section>
</template>

<script>
import { api } from "../lib/api";

const FIELDS = [{ key: "fullName", label: "Nombre completo" }];

export default {
  name: "ProfileView",
  data() {
    return {
      FIELDS,
      form: {},
      email: "",
      loading: true,
      saving: false,
      error: "",
      success: "",
    };
  },
  mounted() {
    this.load();
  },
  methods: {
    async load() {
      try {
        const { data } = await api.me();
        this.email = data.email ?? "";
        for (const f of FIELDS) this.form[f.key] = data[f.key] ?? "";
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
    async save() {
      this.saving = true;
      this.error = "";
      this.success = "";
      try {
        const payload = Object.fromEntries(
          FIELDS.map((f) => {
            const value = (this.form[f.key] ?? "").trim();
            return [f.key, value === "" ? null : value];
          }),
        );
        await api.updateMe(payload);
        this.success = "Perfil actualizado";
      } catch (err) {
        this.error = err.message;
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>
