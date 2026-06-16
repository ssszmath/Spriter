<script setup lang="ts">
import { ref } from 'vue'
import type { VideoInfo } from '../composables/useVideoProcessor'

const emit = defineEmits<{
  (e: 'video-loaded', file: File): void
}>()

defineProps<{
  videoInfo: VideoInfo | null
  videoUrl: string | null
}>()

const dragOver = ref(false)
const fileInput = ref<HTMLInputElement | null>()

function onDragOver(e: DragEvent) {
  e.preventDefault()
  dragOver.value = true
}
function onDragLeave() {
  dragOver.value = false
}
function onDrop(e: DragEvent) {
  e.preventDefault()
  dragOver.value = false
  const file = e.dataTransfer?.files[0]
  if (file) validateAndEmit(file)
}
function onClick() {
  fileInput.value?.click()
}
function onFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) validateAndEmit(file)
}
function validateAndEmit(file: File) {
  if (!['video/mp4', 'video/webm', 'video/ogg'].includes(file.type)) {
    alert('فرمت ویدئو باید MP4, WebM یا Ogg باشد')
    return
  }
  emit('video-loaded', file)
}
function fmt(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
</script>

<template>
  <div class="uploader">
    <div v-if="!videoUrl" class="drop-zone" :class="{ hover: dragOver }"
      @dragover.prevent="onDragOver" @dragleave="onDragLeave" @drop="onDrop" @click="onClick">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      <p class="drop-title">ویدئو را اینجا رها کنید</p>
      <p class="drop-sub">یا کلیک کنید تا از سیستم انتخاب کنید</p>
      <span class="formats">MP4 · WebM · Ogg</span>
      <input ref="fileInput" type="file" accept="video/mp4,video/webm,video/ogg" hidden @change="onFileSelect" />
    </div>
    <div v-else class="preview">
      <video :src="videoUrl" controls class="video" preload="metadata"></video>
      <div v-if="videoInfo" class="badges">
        <span class="badge">{{ fmt(videoInfo.duration) }}</span>
        <span class="badge">{{ videoInfo.width }}×{{ videoInfo.height }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.uploader {
  width: 100%;
}
.drop-zone {
  border: 2px dashed var(--border);
  border-radius: 16px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s;
  background: var(--surface);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}
.drop-zone:hover, .drop-zone.hover {
  border-color: var(--accent);
  background: var(--surface-hover);
  transform: translateY(-1px);
  box-shadow: 0 8px 30px var(--shadow);
}
.icon {
  width: 48px;
  height: 48px;
  color: var(--accent);
}
.drop-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}
.drop-sub {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
}
.formats {
  font-size: 0.75rem;
  color: var(--text-muted);
  letter-spacing: 0.5px;
}
.preview {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: #000;
}
.video {
  width: 100%;
  max-height: 420px;
  display: block;
  object-fit: contain;
}
.badges {
  position: absolute;
  bottom: 10px;
  left: 10px;
  display: flex;
  gap: 6px;
}
.badge {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  color: #fff;
  padding: 3px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
}
</style>
