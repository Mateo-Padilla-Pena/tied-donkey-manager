<template>
  <v-dialog :model-value="true" max-width="440" @update:model-value="onToggle">
    <v-card :title="title">
      <v-card-text>
        <p>{{ message }}</p>
        <v-alert v-if="error" type="error" variant="tonal" class="mt-4">{{ error }}</v-alert>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" :disabled="loading" @click="$emit('cancel')">Cancelar</v-btn>
        <v-btn color="error" variant="flat" :loading="loading" @click="$emit('confirm')">
          Eliminar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "ConfirmDialog",
  props: {
    title: { type: String, default: "Confirmar eliminación" },
    message: String,
    loading: Boolean,
    error: String,
  },
  emits: ["confirm", "cancel"],
  methods: {
    // Closing by scrim or Escape counts as cancel
    onToggle(open) {
      if (!open) this.$emit("cancel");
    },
  },
};
</script>
