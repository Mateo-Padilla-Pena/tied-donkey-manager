<template>
  <section>
    <header class="page-header">
      <div>
        <h1>{{ mod.label }}</h1>
        <p class="muted">{{ meta.total }} registros</p>
      </div>
      <v-btn color="primary" @click="openCreate">Nuevo</v-btn>
    </header>

    <div class="toolbar">
      <v-text-field
        v-if="mod.searchable"
        v-model="q"
        :placeholder="mod.searchPlaceholder"
        clearable
        hide-details
        class="toolbar-search"
      />
      <v-select
        v-for="f in mod.filters"
        :key="f.key"
        v-model="filters[f.key]"
        :items="filterItems(f)"
        item-title="label"
        item-value="value"
        :label="f.label"
        hide-details
        class="toolbar-filter"
      />
    </div>

    <!-- The table always renders; errors are shown above it with a retry -->
    <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
      <p class="font-weight-medium">No se pudieron cargar los {{ mod.label.toLowerCase() }}</p>
      <p class="mt-1">{{ error }}</p>
      <template #append>
        <v-btn variant="outlined" :loading="loading" @click="load">Reintentar</v-btn>
      </template>
    </v-alert>

    <v-card>
      <ResourceTable
        :module="mod"
        :rows="rows"
        :total="meta.total"
        :page="page"
        :items-per-page="pageSize"
        :loading="loading"
        @update:options="onOptions"
        @edit="openEdit"
        @delete="toDelete = $event"
      />
    </v-card>

    <ResourceFormDialog
      v-if="formOpen"
      :title="formTitle"
      :fields="mod.fields"
      :record="editing"
      :options="options"
      :with-images="!!mod.images"
      :saving="saving"
      :error="formError"
      @save="save"
      @close="formOpen = false"
    />

    <ConfirmDialog
      v-if="toDelete"
      :message="deleteMessage"
      :loading="deleting"
      :error="deleteError"
      @confirm="confirmDelete"
      @cancel="toDelete = null"
    />
  </section>
</template>

<script>
import { api } from "../lib/api";
import { notify } from "../lib/notify";
import { getModule, sources } from "../config/modules";
import ResourceTable from "../components/ResourceTable.vue";
import ResourceFormDialog from "../components/ResourceFormDialog.vue";
import ConfirmDialog from "../components/ConfirmDialog.vue";

export default {
  name: "ResourceView",
  components: { ResourceTable, ResourceFormDialog, ConfirmDialog },
  props: {
    moduleKey: { type: String, required: true },
  },
  data() {
    const mod = getModule(this.moduleKey);
    return {
      mod,
      rows: [],
      meta: { total: 0 },
      loading: false,
      error: "",
      q: "",
      page: 1,
      pageSize: 20,
      filters: Object.fromEntries(mod.filters.map((f) => [f.key, null])),
      // Select options keyed by source name (categories, suppliers)
      options: {},
      formOpen: false,
      editing: null,
      saving: false,
      formError: "",
      toDelete: null,
      deleting: false,
      deleteError: "",
      searchTimer: null,
    };
  },
  computed: {
    deleteMessage() {
      const note = this.mod.deleteNote ? ` ${this.mod.deleteNote}` : "";
      return `¿Seguro que deseas eliminar este registro de ${this.mod.label.toLowerCase()}?${note} Esta acción no se puede deshacer.`;
    },
    formTitle() {
      const label = this.mod.label.toLowerCase();
      return this.editing ? `Editar ${label}` : `Nuevo ${label}`;
    },
  },
  watch: {
    // Debounced search; filters reload immediately
    q() {
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => {
        this.page = 1;
        this.load();
      }, 300);
    },
    filters: {
      deep: true,
      handler() {
        this.page = 1;
        this.load();
      },
    },
  },
  created() {
    this.loadOptions().catch((err) => (this.error = err.message));
    this.load();
  },
  methods: {
    // Adds an "all" entry so a filter can be cleared
    filterItems(f) {
      return [{ label: "Todos", value: null }, ...(this.options[f.source] ?? [])];
    },
    async loadOptions() {
      const sourceNames = new Set([
        ...this.mod.filters.map((f) => f.source),
        ...this.mod.fields.filter((f) => f.source).map((f) => f.source),
      ]);

      await Promise.all(
        [...sourceNames].map(async (name) => {
          const res = await api.list(sources[name].endpoint, { pageSize: 100 });
          this.options[name] = res.data.map((item) => ({ value: item.id, label: item.name }));
        }),
      );
    },
    async load() {
      this.loading = true;
      this.error = "";
      try {
        const res = await api.list(this.mod.endpoint, {
          q: this.mod.searchable ? this.q : undefined,
          page: this.page,
          pageSize: this.pageSize,
          ...this.filters,
        });
        this.rows = res.data;
        this.meta = res.meta;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
    // Fired by the table on mount and whenever page or page size changes
    onOptions({ page, itemsPerPage }) {
      if (page === this.page && itemsPerPage === this.pageSize) return;
      this.page = page;
      this.pageSize = itemsPerPage;
      this.load();
    },
    openCreate() {
      this.editing = null;
      this.formError = "";
      this.formOpen = true;
    },
    openEdit(row) {
      this.editing = row;
      this.formError = "";
      this.formOpen = true;
    },
    async save(payload, { staged = [], removed = [] } = {}) {
      this.saving = true;
      this.formError = "";

      let product;
      try {
        product = this.editing
          ? (await api.update(this.mod.endpoint, this.editing.id, payload)).data
          : (await api.create(this.mod.endpoint, payload)).data;
      } catch (err) {
        this.formError = err.message;
        this.saving = false;
        return;
      }

      // Later retries update this record instead of creating a duplicate
      this.editing = product;

      if (this.mod.images) {
        try {
          await this.syncImages(product.id, staged, removed);
        } catch (err) {
          // The product is already saved, so the dialog closes and the reason is shown
          notify(`El producto se guardó, pero no se pudieron subir todas las imágenes: ${err.message}`);
        }
      }

      this.formOpen = false;
      this.saving = false;
      await this.load();
    },
    // Removes deleted images, then uploads the new ones in order
    async syncImages(productId, staged, removed) {
      for (const imageId of removed) {
        await api.removeProductImage(productId, imageId);
      }
      for (const [index, file] of staged.entries()) {
        // The API wraps the result in { data }, so the fields are read from data
        const { data: stored } = await api.uploadImage(this.mod.images.target, file, productId);
        await api.addProductImage(productId, {
          storagePath: stored.storagePath,
          contentType: stored.contentType,
          sizeBytes: stored.sizeBytes,
          sortOrder: index,
        });
      }
    },
    async confirmDelete() {
      this.deleting = true;
      this.deleteError = "";
      try {
        await api.remove(this.mod.endpoint, this.toDelete.id);
        // Step back a page if the last row of the current page was removed
        if (this.rows.length === 1 && this.page > 1) this.page -= 1;
        this.toDelete = null;
        await this.load();
      } catch (err) {
        this.deleteError = err.message;
      } finally {
        this.deleting = false;
      }
    },
  },
};
</script>
