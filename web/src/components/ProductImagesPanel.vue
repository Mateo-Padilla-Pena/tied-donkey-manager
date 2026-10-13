<template>
  <div class="images-panel">
    <h3 class="images-title">Imágenes</h3>

    <label class="images-drop">
      <input
        type="file"
        accept="image/*"
        multiple
        hidden
        @change="onPick"
      />
      <span>Seleccionar imágenes</span>
    </label>

    <div v-if="existing.length || staged.length" class="thumbs">
      <div v-for="img in existing" :key="img.id" class="thumb">
        <img v-if="previews[img.id]" :src="previews[img.id]" alt="Imagen del producto" />
        <span v-else class="thumb-loading">Cargando…</span>
        <button class="thumb-remove" type="button" aria-label="Quitar imagen" @click="$emit('remove-existing', img)">
          &times;
        </button>
      </div>
      <div v-for="(item, index) in staged" :key="item.key" class="thumb">
        <span class="thumb-tag">Nueva</span>
        <img :src="item.preview" alt="Imagen pendiente" />
        <button class="thumb-remove" type="button" aria-label="Quitar imagen" @click="$emit('remove-staged', index)">
          &times;
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchImageBlob } from "../lib/api";

export default {
  name: "ProductImagesPanel",
  props: {
    existing: { type: Array, default: () => [] },
    staged: { type: Array, default: () => [] },
  },
  emits: ["add", "remove-existing", "remove-staged"],
  data() {
    // Object URLs of the stored images, keyed by image id
    return { previews: {} };
  },
  watch: {
    existing: {
      immediate: true,
      handler(list) {
        list.forEach((img) => this.loadPreview(img));
      },
    },
  },
  beforeUnmount() {
    Object.values(this.previews).forEach((url) => URL.revokeObjectURL(url));
  },
  methods: {
    async loadPreview(img) {
      if (this.previews[img.id]) return;
      try {
        const blob = await fetchImageBlob(img.storagePath);
        this.previews = { ...this.previews, [img.id]: URL.createObjectURL(blob) };
      } catch {
        // Leaves the placeholder; the form still works without the preview
      }
    },
    onPick(event) {
      const files = Array.from(event.target.files ?? []);
      if (files.length) this.$emit("add", files);
      // Clears the input so picking the same file again still fires change
      event.target.value = "";
    },
  },
};
</script>

<style scoped>
.images-panel {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.thumb-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--muted);
  font-size: 0.8rem;
}

.images-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.images-drop {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 84px;
  padding: 1rem;
  border: 1px dashed var(--border);
  border-radius: 12px;
  background: var(--primary-soft);
  color: var(--primary);
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.images-drop:hover {
  border-color: var(--primary);
}

/* Every thumbnail has the same square size; images are cropped to fill it */
.thumbs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 0.6rem;
}

.thumb {
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--surface);
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.thumb-tag {
  position: absolute;
  top: 4px;
  left: 4px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--primary);
  color: #fff;
  font-size: 0.7rem;
  z-index: 1;
}

.thumb-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: rgb(0 0 0 / 0.6);
  color: #fff;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
}

.thumb-remove:hover {
  background: rgb(0 0 0 / 0.85);
}
</style>
