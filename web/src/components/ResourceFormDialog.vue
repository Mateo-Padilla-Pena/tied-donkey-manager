<template>
  <v-dialog
    :model-value="true"
    :max-width="withImages ? 1400 : compact ? 480 : 680"
    scrollable
    @update:model-value="onToggle"
  >
    <v-card :title="title">
      <v-form @submit.prevent="submit">
        <v-card-text>
          <v-row>
            <v-col cols="12" :md="withImages ? 7 : 12" class="form-fields">
              <h3 v-if="withImages" class="section-title">Información del producto</h3>
              <v-row dense>
                <v-col v-for="f in fields" :key="f.key" cols="12" :md="compact || isWide(f) ? 12 : 6">
                  <v-select
                    v-if="f.type === 'select'"
                    v-model="form[f.key]"
                    :items="optionsFor(f)"
                    item-title="label"
                    item-value="value"
                    :label="labelFor(f)"
                    :error-messages="errorsFor(f)"
                  />

                  <v-select
                    v-else-if="f.type === 'multiselect'"
                    v-model="form[f.key]"
                    :items="optionsFor(f)"
                    item-title="label"
                    item-value="value"
                    :label="labelFor(f)"
                    :error-messages="errorsFor(f)"
                    multiple
                    chips
                    closable-chips
                  />

                  <v-textarea
                    v-else-if="f.type === 'textarea'"
                    v-model="form[f.key]"
                    :label="labelFor(f)"
                    :error-messages="errorsFor(f)"
                    rows="3"
                  />

                  <v-text-field
                    v-else
                    v-model="form[f.key]"
                    :label="labelFor(f)"
                    :type="f.type === 'number' ? 'number' : 'text'"
                    :step="f.step"
                    :min="f.min"
                    :error-messages="errorsFor(f)"
                  />
                </v-col>
              </v-row>
            </v-col>

            <v-col v-if="withImages" cols="12" md="5" class="form-images">
              <ProductImagesPanel
                :existing="existing"
                :staged="staged"
                @add="addFiles"
                @remove-existing="removeExisting"
                @remove-staged="removeStaged"
              />
            </v-col>
          </v-row>

          <v-alert v-if="error" type="error" variant="tonal" class="mt-4">{{ error }}</v-alert>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" :disabled="saving" @click="$emit('close')">Cancelar</v-btn>
          <v-btn color="primary" variant="flat" type="submit" :loading="saving">Guardar</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.section-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
}

/* Vertical separator between the fields and the image panel on wide screens */
.form-images {
  border-left: 1px solid var(--border);
  padding-left: 1.5rem;
}

/* On narrow screens the panel moves below the fields with a horizontal separator */
@media (max-width: 959px) {
  .form-images {
    border-left: none;
    border-top: 1px solid var(--border);
    padding-left: 12px;
    padding-top: 1.25rem;
    margin-top: 0.5rem;
  }
}
</style>

<script>
import ProductImagesPanel from "./ProductImagesPanel.vue";

// Empty value for a field type when there is no record yet
const emptyValue = (field) => (field.type === "multiselect" ? [] : null);

export default {
  name: "ResourceFormDialog",
  components: { ProductImagesPanel },
  props: {
    title: String,
    fields: { type: Array, required: true },
    record: { type: Object, default: null },
    options: { type: Object, default: () => ({}) },
    withImages: Boolean,
    saving: Boolean,
    error: String,
  },
  emits: ["save", "close"],
  data() {
    // Initial values come from the record when editing, empty otherwise
    const form = Object.fromEntries(
      this.fields.map((f) => {
        if (!this.record) return [f.key, emptyValue(f)];
        const value = f.from ? f.from(this.record) : this.record[f.key];
        return [f.key, value ?? emptyValue(f)];
      }),
    );
    return {
      form,
      fieldErrors: {},
      // Images already stored (removing one is deferred until save)
      existing: (this.record?.images ?? []).map((img) => ({ ...img })),
      removedIds: [],
      // New files waiting to be uploaded on save
      staged: [],
    };
  },
  beforeUnmount() {
    this.staged.forEach((item) => URL.revokeObjectURL(item.preview));
  },
  computed: {
    // Small forms (one or two plain fields, no images) get a narrow dialog
    compact() {
      return !this.withImages && this.fields.length <= 2 && !this.fields.some((f) => this.isWide(f));
    },
  },
  methods: {
    isWide(field) {
      return field.type === "textarea" || field.type === "multiselect";
    },
    labelFor(field) {
      return field.required ? `${field.label} *` : field.label;
    },
    errorsFor(field) {
      return this.fieldErrors[field.key] ? [this.fieldErrors[field.key]] : [];
    },
    optionsFor(field) {
      return this.options[field.source] ?? [];
    },
    onToggle(open) {
      if (!open) this.$emit("close");
    },
    addFiles(files) {
      for (const file of files) {
        this.staged.push({
          key: `${Date.now()}-${Math.random()}`,
          file,
          preview: URL.createObjectURL(file),
        });
      }
    },
    removeExisting(image) {
      this.existing = this.existing.filter((img) => img.id !== image.id);
      this.removedIds.push(image.id);
    },
    removeStaged(index) {
      URL.revokeObjectURL(this.staged[index].preview);
      this.staged.splice(index, 1);
    },
    validate() {
      const errors = {};
      for (const f of this.fields.filter((f) => f.required)) {
        const value = this.form[f.key];
        const empty =
          value === null || value === undefined || (Array.isArray(value) ? value.length === 0 : String(value).trim() === "");
        if (empty) errors[f.key] = "Campo obligatorio";
      }
      this.fieldErrors = errors;
      return Object.keys(errors).length === 0;
    },
    // Empty optional text becomes null; numbers are converted from the input string
    buildPayload() {
      return Object.fromEntries(
        this.fields.map((f) => {
          const value = this.form[f.key];
          if (f.type === "number") return [f.key, value === "" || value === null ? null : Number(value)];
          if (f.type === "multiselect") return [f.key, value ?? []];
          const text = typeof value === "string" ? value.trim() : value;
          return [f.key, text === "" || text === null ? (f.required ? "" : null) : text];
        }),
      );
    },
    submit() {
      if (!this.validate()) return;
      this.$emit("save", this.buildPayload(), {
        staged: this.staged.map((item) => item.file),
        removed: [...this.removedIds],
      });
    },
  },
};
</script>
