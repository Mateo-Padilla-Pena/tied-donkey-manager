<template>
  <v-snackbar v-model="notice.visible" :color="notice.color" :timeout="-1" location="top right">
    {{ notice.message }}
    <template #actions>
      <v-btn variant="text" @click="notice.visible = false">Cerrar</v-btn>
    </template>
  </v-snackbar>
</template>

<script>
import { notice } from "../lib/notify";

export default {
  name: "AppNotifier",
  data() {
    return { notice };
  },
};
</script>
