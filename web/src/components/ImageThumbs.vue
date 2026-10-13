<template>
  <div v-if="paths.length" class="thumb-cell">
    <button type="button" class="thumb-button" aria-label="Ver imágenes del producto" @click="open = true">
      <img v-if="thumb" :src="thumb" alt="Miniatura del producto" />
      <span v-else class="thumb-empty">…</span>
    </button>
    <span v-if="paths.length > 1" class="thumb-count">+{{ paths.length - 1 }}</span>

    <v-dialog v-model="open" max-width="900">
      <v-card title="Imágenes del producto">
        <v-card-text>
          <div class="gallery">
            <img v-for="(url, i) in urls" :key="i" :src="url" alt="Imagen del producto" />
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
  <span v-else class="muted">Sin imagen</span>
</template>

<script>
import { fetchImageBlob } from "../lib/api";

export default {
  name: "ImageThumbs",
  props: {
    // Storage paths of the product images, first one is the thumbnail
    paths: { type: Array, default: () => [] },
  },
  data() {
    return { thumb: null, urls: [], open: false };
  },
  watch: {
    paths: {
      immediate: true,
      handler(list) {
        this.loadThumb(list[0]);
      },
    },
    // Full set is fetched only when the dialog opens
    open(value) {
      if (value && this.urls.length === 0) this.loadAll();
    },
  },
  beforeUnmount() {
    [this.thumb, ...this.urls].forEach((url) => url && URL.revokeObjectURL(url));
  },
  methods: {
    async loadThumb(path) {
      if (!path) return;
      try {
        this.thumb = URL.createObjectURL(await fetchImageBlob(path));
      } catch {
        // Keeps the placeholder when the image cannot be loaded
      }
    },
    async loadAll() {
      try {
        const blobs = await Promise.all(this.paths.map((path) => fetchImageBlob(path)));
        this.urls = blobs.map((blob) => URL.createObjectURL(blob));
      } catch {
        this.urls = [];
      }
    },
  },
};
</script>

<style scoped>
.thumb-cell {
  position: relative;
  display: inline-flex;
}

.thumb-button {
  width: 48px;
  height: 48px;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  background: var(--surface);
  cursor: zoom-in;
}

.thumb-button img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.thumb-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--muted);
}

.thumb-count {
  position: absolute;
  right: -6px;
  bottom: -6px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--primary);
  color: #fff;
  font-size: 0.7rem;
  line-height: 1.4;
}

.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.75rem;
}

.gallery img {
  width: 100%;
  border-radius: 12px;
  border: 1px solid var(--border);
  object-fit: contain;
}
</style>
