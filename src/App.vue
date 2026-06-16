<script setup lang="ts">
import { ref } from 'vue'
import { useVideoProcessor } from './composables/useVideoProcessor'
import { useSpriteGenerator } from './composables/useSpriteGenerator'
import VideoUploader from './components/VideoUploader.vue'
import FrameGallery from './components/FrameGallery.vue'
import AnimationPreview from './components/AnimationPreview.vue'
import SpriteSheetPanel from './components/SpriteSheetPanel.vue'

const {
  videoUrl, videoInfo, frames, selectedFrames, selectedCount,
  totalFrames, isLoading, progress, error, extractInterval,
  loadVideo, extractAllFrames, toggleFrame, selectAll, deselectAll,
  clearFrames, cleanup,
} = useVideoProcessor()

const {
  spriteSheetUrl, columns, quality,
  frameWidth, frameHeight, spriteFrameCount,
  generate, getSpriteSheetJSON,
} = useSpriteGenerator()

const dark = ref(false)

function toggleTheme() {
  dark.value = !dark.value
  document.documentElement.setAttribute('data-theme', dark.value ? 'dark' : 'light')
}

async function onVideoLoaded(file: File) {
  clearFrames()
  await loadVideo(file)
  await extractAllFrames()
}

async function onReExtract() {
  await extractAllFrames()
}

async function onGenerate() {
  if (selectedFrames.value.length < 2) return
  await generate(selectedFrames.value, columns.value)
}
</script>

<template>
  <div class="app">
    <header class="header">
      <div class="header-inner">
        <div class="brand">
          <svg class="logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="2" width="20" height="20" rx="3" />
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v7" />
            <path d="M12 15v7" />
            <path d="M2 12h7" />
            <path d="M15 12h7" />
          </svg>
          <div class="brand-text">
            <h1 class="brand-name">Spriter</h1>
            <span class="brand-sub">Sprite Sheet Maker</span>
          </div>
        </div>
        <button class="theme-btn" @click="toggleTheme" :title="dark ? 'حالت روشن' : 'حالت تاریک'">
          <svg v-if="dark" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
          <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>
      </div>
    </header>

    <main class="main">
      <div v-if="error" class="toast">{{ error }}</div>

      <section class="card">
        <VideoUploader :video-info="videoInfo" :video-url="videoUrl" @video-loaded="onVideoLoaded" />
      </section>

      <template v-if="videoInfo">
        <section class="card">
          <FrameGallery
            :frames="frames" :selected-count="selectedCount" :total-frames="totalFrames"
            :extract-interval="extractInterval" :is-loading="isLoading" :progress="progress"
            @toggle-frame="toggleFrame" @select-all="selectAll" @deselect-all="deselectAll"
            @update:extract-interval="extractInterval = $event" @re-extract="onReExtract" />
        </section>

        <section class="card">
          <AnimationPreview
            :frames="selectedFrames" :sprite-sheet-url="spriteSheetUrl"
            :frame-width="frameWidth" :frame-height="frameHeight"
            :sprite-frame-count="spriteFrameCount" :columns="columns" />
        </section>

        <section class="card">
          <SpriteSheetPanel
            :frames="selectedFrames" :sprite-sheet-url="spriteSheetUrl"
            :frame-width="frameWidth" :frame-height="frameHeight"
            :sprite-frame-count="spriteFrameCount" :columns="columns" :quality="quality"
            :has-sprite="!!spriteSheetUrl"
            @update:columns="columns = $event" @update:quality="quality = $event"
            @generate="onGenerate" />
        </section>
      </template>
    </main>

    <footer class="footer">
      <p>Spriter &mdash; ساخته‌شده با Vue 3 + Vite</p>
    </footer>
  </div>
</template>

<style>
:root, [data-theme='light'] {
  --bg: #f2f3f7;
  --surface: #ffffff;
  --surface-hover: #f0f0f4;
  --text: #1a1a2e;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  --border: #e5e7eb;
  --accent: #7c3aed;
  --accent-hover: #6d28d9;
  --accent-soft: rgba(124, 58, 237, 0.08);
  --shadow: rgba(0, 0, 0, 0.06);
  --error: #ef4444;
  --checkerboard: repeating-conic-gradient(#e5e7eb 0% 25%, #fff 0% 50%) 0 0 / 20px 20px;
}
[data-theme='dark'] {
  --bg: #0f0f1a;
  --surface: #1a1a2e;
  --surface-hover: #252540;
  --text: #e4e4f0;
  --text-secondary: #9ca3af;
  --text-muted: #6b7280;
  --border: #2d2d45;
  --accent: #8b5cf6;
  --accent-hover: #a78bfa;
  --accent-soft: rgba(139, 92, 246, 0.12);
  --shadow: rgba(0, 0, 0, 0.3);
  --error: #f87171;
  --checkerboard: repeating-conic-gradient(#2d2d45 0% 25%, #1a1a2e 0% 50%) 0 0 / 20px 20px;
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif;
  background: var(--bg); color: var(--text); line-height: 1.6;
  -webkit-font-smoothing: antialiased; direction: rtl;
}
</style>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.header {
  position: sticky; top: 0; z-index: 100;
  background: color-mix(in srgb, var(--surface) 75%, transparent);
  backdrop-filter: blur(20px) saturate(1.5);
  border-bottom: 1px solid var(--border);
}
.header-inner {
  max-width: 960px; margin: 0 auto; padding: 0.75rem 1.5rem;
  display: flex; align-items: center; justify-content: space-between;
}
.brand {
  display: flex; align-items: center; gap: 0.65rem;
}
.logo {
  width: 28px; height: 28px; color: var(--accent);
}
.brand-text {
  display: flex; flex-direction: column; gap: 0;
}
.brand-name {
  font-size: 1.25rem; font-weight: 800; color: var(--text);
  letter-spacing: -0.5px; line-height: 1.2;
}
.brand-sub {
  font-size: 0.7rem; color: var(--text-secondary);
  letter-spacing: 0.3px;
}
.theme-btn {
  width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
  border-radius: 10px; border: 1px solid var(--border); background: var(--surface);
  color: var(--text-secondary); cursor: pointer; transition: all 0.15s;
}
.theme-btn:hover { background: var(--surface-hover); color: var(--text); }
.main {
  flex: 1; max-width: 960px; width: 100%; margin: 0 auto;
  padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;
}
.card {
  background: var(--surface); border-radius: 16px; padding: 1.25rem;
  border: 1px solid var(--border); transition: box-shadow 0.2s;
}
.card:hover {
  box-shadow: 0 4px 24px var(--shadow);
}
.toast {
  padding: 0.75rem 1rem; background: var(--error); color: #fff;
  border-radius: 10px; font-size: 0.85rem; text-align: center;
}
.footer {
  text-align: center; padding: 1.5rem; font-size: 0.75rem;
  color: var(--text-muted); border-top: 1px solid var(--border);
  margin-top: 1rem;
}
.footer p { margin: 0; }
</style>
