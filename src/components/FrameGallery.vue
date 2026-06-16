<script setup lang="ts">
import type { FrameData } from '../composables/useVideoProcessor'

defineProps<{
  frames: FrameData[]
  selectedCount: number
  totalFrames: number
  extractInterval: number
  isLoading: boolean
  progress: number
}>()

const emit = defineEmits<{
  (e: 'toggle-frame', id: number): void
  (e: 'select-all'): void
  (e: 'deselect-all'): void
  (e: 'update:extractInterval', v: number): void
  (e: 're-extract'): void
}>()

function fmt(s: number) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}
</script>

<template>
  <div class="gallery">
    <div class="gallery-header">
      <h3 class="title">فریم‌ها</h3>
      <span class="count">{{ totalFrames }} فریم · {{ selectedCount }} انتخاب‌شده</span>
    </div>

    <div class="toolbar">
      <div class="interval-group">
        <label class="label">فاصله استخراج</label>
        <div class="interval-btns">
          <button v-for="i in [0.2, 0.5, 1, 2]" :key="i"
            class="btn btn-xs" :class="{ active: extractInterval === i }"
            @click="emit('update:extractInterval', i); emit('re-extract')">
            {{ i === 0.2 ? '0.2s' : i + 's' }}
          </button>
        </div>
      </div>
      <div class="action-group">
        <button class="btn btn-xs" @click="emit('select-all')">انتخاب همه</button>
        <button class="btn btn-xs" @click="emit('deselect-all')">لغو همه</button>
      </div>
    </div>

    <div v-if="isLoading" class="progress-wrap">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
      <span class="progress-text">در حال استخراج {{ progress }}%</span>
    </div>

    <div v-if="frames.length" class="grid">
      <div v-for="frame in frames" :key="frame.id"
        class="thumb" :class="{ selected: frame.selected }"
        @click="emit('toggle-frame', frame.id)">
        <img :src="frame.canvas.toDataURL()" :alt="'Frame at ' + fmt(frame.time)" class="thumb-img" />
        <div class="thumb-overlay" v-if="frame.selected">
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" width="20" height="20">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <span class="thumb-time">{{ fmt(frame.time) }}</span>
      </div>
    </div>
    <div v-else-if="!isLoading" class="empty">
      <p>ویدئو را آپلود کنید تا فریم‌ها استخراج شوند</p>
    </div>
  </div>
</template>

<style scoped>
.gallery {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.gallery-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}
.count {
  font-size: 0.8rem;
  color: var(--text-secondary);
  direction: ltr;
}
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}
.interval-group, .action-group {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  white-space: nowrap;
}
.interval-btns {
  display: flex;
  gap: 0.2rem;
}
.btn {
  padding: 0.35rem 0.65rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.15s;
}
.btn:hover {
  background: var(--surface-hover);
}
.btn.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}
.btn-xs {
  padding: 0.25rem 0.55rem;
  font-size: 0.75rem;
}
.action-group {
  margin-left: auto;
}
.progress-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--border);
  border-radius: 3px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 3px;
  transition: width 0.3s;
}
.progress-text {
  font-size: 0.75rem;
  color: var(--text-secondary);
  white-space: nowrap;
}
.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-height: 320px;
  overflow-y: auto;
  padding: 4px 2px;
}
.thumb {
  position: relative;
  width: 100px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
  background: var(--surface);
}
.thumb:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow);
}
.thumb.selected {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent);
}
.thumb-img {
  width: 100%;
  height: 56px;
  object-fit: cover;
  display: block;
}
.thumb-overlay {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
}
.thumb-time {
  display: block;
  text-align: center;
  font-size: 0.65rem;
  color: var(--text-secondary);
  padding: 2px 0;
  direction: ltr;
}
.empty {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
}
.empty p {
  margin: 0;
}
</style>
