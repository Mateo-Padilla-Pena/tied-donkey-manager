<template>
  <v-data-table-server
    :headers="headers"
    :items="items"
    :items-length="total"
    :loading="loading"
    :page="page"
    :items-per-page="itemsPerPage"
    :items-per-page-options="[10, 20, 50, 100]"
    item-value="id"
    hover
    @update:options="$emit('update:options', $event)"
  >
    <template #item.images="{ item }">
      <ImageThumbs :paths="item.images" />
    </template>

    <template #item.actions="{ item }">
      <v-menu location="bottom end">
        <template #activator="{ props }">
          <v-btn v-bind="props" icon variant="text" size="small" aria-label="Acciones">
            <svg class="action-icon" viewBox="0 0 24 24" aria-hidden="true"><path :d="icons.dots" fill="currentColor" /></svg>
          </v-btn>
        </template>
        <v-list density="comfortable" min-width="180" class="action-menu">
          <v-list-item @click="$emit('edit', item.row)">
            <template #prepend>
              <svg class="action-icon" viewBox="0 0 24 24" aria-hidden="true"><path :d="icons.edit" fill="currentColor" /></svg>
            </template>
            <v-list-item-title>Editar</v-list-item-title>
          </v-list-item>
          <v-divider class="my-2" />
          <v-list-item base-color="error" @click="$emit('delete', item.row)">
            <template #prepend>
              <svg class="action-icon" viewBox="0 0 24 24" aria-hidden="true"><path :d="icons.remove" fill="currentColor" /></svg>
            </template>
            <v-list-item-title>Eliminar</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>
  </v-data-table-server>
</template>

<script>
import { mdiDotsVertical, mdiPencilOutline, mdiTrashCanOutline } from "@mdi/js";
import { formatDate, formatMoney, getPath } from "../lib/utils";
import ImageThumbs from "./ImageThumbs.vue";

// Long text is cut in the table; the full value is still in the form
const MAX_TEXT = 60;

export default {
  name: "ResourceTable",
  components: { ImageThumbs },
  props: {
    module: { type: Object, required: true },
    rows: { type: Array, default: () => [] },
    total: { type: Number, default: 0 },
    page: { type: Number, default: 1 },
    itemsPerPage: { type: Number, default: 20 },
    loading: Boolean,
  },
  emits: ["edit", "delete", "update:options"],
  data() {
    return { icons: { dots: mdiDotsVertical, edit: mdiPencilOutline, remove: mdiTrashCanOutline } };
  },
  computed: {
    // One header per column, keyed c0, c1... so dotted paths never reach slot names
    headers() {
      // Image columns use the "images" slot; the rest are keyed by position
      const cols = this.module.columns.map((col, i) => ({
        title: col.label,
        key: col.format === "image" ? "images" : `c${i}`,
        sortable: false,
      }));
      cols.push({ title: "Acciones", key: "actions", sortable: false, align: "end" });
      return cols;
    },
    items() {
      return this.rows.map((row) => {
        const item = { id: row.id, row };
        this.module.columns.forEach((col, i) => {
          if (col.format === "image") {
            item.images = (row.images ?? []).map((img) => img.storagePath);
          } else {
            item[`c${i}`] = this.cellText(row, col);
          }
        });
        return item;
      });
    },
  },
  methods: {
    cellText(row, col) {
      const value = getPath(row, col.key);
      let text;
      switch (col.format) {
        case "date":
          text = formatDate(value);
          break;
        case "money":
          text = formatMoney(value);
          break;
        case "chips":
          text = value?.length ? value.map((v) => v.name).join(", ") : "—";
          break;
        default:
          text = value ?? "—";
      }
      if (col.truncate && typeof text === "string" && text.length > MAX_TEXT) {
        return `${text.slice(0, MAX_TEXT)}…`;
      }
      return text;
    },
  },
};
</script>

<style scoped>
.action-icon {
  width: 20px;
  height: 20px;
}

.action-menu {
  padding: 0.2rem;
}

.action-menu :deep(.v-list-item) {
  min-height: 40px;
  border-radius: 10px;
  margin-bottom: 0.1rem;
}

.action-menu :deep(.v-list-item:last-child) {
  margin-bottom: 0;
}

.action-menu :deep(.v-list-item__prepend) {
  margin-inline-end: 0.75rem;
}
</style>
