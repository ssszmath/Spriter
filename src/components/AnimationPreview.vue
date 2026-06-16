<script setup lang="ts">
import { ref, watch, onUnmounted, computed } from 'vue'
import type { FrameData } from '../composables/useVideoProcessor'

const props = defineProps<{
  frames: FrameData[]
}>()

const isPlaying = ref(false)
const currentIndex = ref(0)
const speed = ref(4)
let timer: number | null = null

const speedOpts = [1, 2, 3, 4, 6, 8, 12, 24]

const hasFrames = computed(() => props.frames.length > 0)

const frameW = computed(() => props.frames[0]?.canvas?.width ?? 1)
const frameH = computed(() => props.frames[0]?.canvas?.height ?? 1)

const MAX = 400
const scale = computed(() => Math.min(1, MAX / frameW.value))
const dfw = computed(() => frameW.value * scale.value)
const dfh = computed(() => frameH.value * scale.value)

function currentCanvas(): HTMLCanvasElement | null {
  if (!props.frames.length) return null
  return props.frames[currentIndex.value % props.frames.length]?.canvas ?? null
}

function play() {
  if (!hasFrames.value) return
  isPlaying.value = true
  timer = window.setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % props.frames.length
  }, 1000 / speed.value)
}

function pause() {
  isPlaying.value = false
  if (timer !== null) { clearInterval(timer); timer = null }
}

function toggle() { isPlaying.value ? pause() : play() }

function reset() { pause(); currentIndex.value = 0 }

function next() {
  if (props.frames.length) currentIndex.value = (currentIndex.value + 1) % props.frames.length
}
function prev() {
  if (props.frames.length) currentIndex.value = (currentIndex.value - 1 + props.frames.length) % props.frames.length
}

watch(speed, () => { if (isPlaying.value) { pause(); play() } })
watch(() => props.frames.length, () => { if (currentIndex.value >= props.frames.length) currentIndex.value = 0; if (isPlaying.value) { pause(); play() } })

onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<template>
  <div class="anim">
    <h3 class="title">پیش‌نمایش انیمیشن</h3>

    <div v-if="hasFrames" class="content">
      <div class="frame-wrap" :style="{ width: dfw + 'px', height: dfh + 'px', maxWidth: '100%' }">
        <img v-if="currentCanvas()" :src="currentCanvas()!.toDataURL()"
          class="frame-img" draggable="false" />
      </div>

      <div class="counter">{{ currentIndex + 1 }} / {{ frames.length }}</div>

      <div class="controls">
        <button class="ctrl" @click="prev" title="قبلی">⏮</button>
        <button class="ctrl play" @click="toggle" title="پخش/توقف">
          {{ isPlaying ? '⏸' : '▶' }}
        </button>
        <button class="ctrl" @click="next" title="بعدی">⏭</button>
        <button class="ctrl" @click="reset" title="ریست">⏹</button>
        <div class="speed">
          <label class="lbl">سرعت</label>
          <select class="sel" :value="speed" @change="speed = +($event.target as HTMLSelectElement).value">
            <option v-for="s in speedOpts" :key="s" :value="s">{{ s }} FPS</option>
          </select>
        </div>
      </div>
    </div>

    <div v-else class="empty">
      <p>فریم‌هایی انتخاب نشده</p>
    </div>
  </div>
</template>

<style scoped>
.anim {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}
.frame-wrap {
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid var(--border);
  background: var(--checkerboard);
}
.frame-img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}
.counter {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text);
  font-variant-numeric: tabular-nums;
  direction: ltr;
}
.controls {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-wrap: wrap;
  justify-content: center;
}
.ctrl {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.ctrl:hover {
  background: var(--surface-hover);
}
.ctrl.play {
  width: 46px;
  height: 46px;
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
  font-size: 1.1rem;
}
.ctrl.play:hover {
  opacity: 0.9;
}
.speed {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-left: 0.5rem;
}
.lbl {
  font-size: 0.75rem;
  color: var(--text-secondary);
}
.sel {
  padding: 0.25rem 0.4rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--text);
  font-size: 0.8rem;
}
.sel:focus {
  outline: none;
  border-color: var(--accent);
}
.empty {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
  border: 1px dashed var(--border);
  border-radius: 12px;
}
.empty p { margin: 0; }
</style>
