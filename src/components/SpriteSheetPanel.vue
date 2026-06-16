<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FrameData } from '../composables/useVideoProcessor'

const props = defineProps<{
  frames: FrameData[]
  spriteSheetUrl: string | null
  frameWidth: number
  frameHeight: number
  spriteFrameCount: number
  columns: number
  quality: number
}>()

const emit = defineEmits<{
  (e: 'update:columns', v: number): void
  (e: 'update:quality', v: number): void
  (e: 'generate'): void
}>()

const zoom = ref<number | null>(null)
const panX = ref(0)
const panY = ref(0)
const isPan = ref(false)
const pStart = ref({ x: 0, y: 0 })
const vpRef = ref<HTMLDivElement | null>()

function fitToVp() {
  if (!vpRef.value) return
  const img = vpRef.value.querySelector('img')
  if (!img || !img.naturalWidth) return
  const r = vpRef.value.getBoundingClientRect()
  const s = Math.min((r.width - 16) / img.naturalWidth, (r.height - 16) / img.naturalHeight, 1)
  zoom.value = s
  panX.value = 0
  panY.value = 0
}

function zi() { if (zoom.value !== null) zoom.value = Math.min(zoom.value * 1.5, 10) }
function zo() { if (zoom.value !== null) zoom.value = Math.max(zoom.value / 1.5, 0.1) }
function rst() { fitToVp() }

function md(e: MouseEvent) { isPan.value = true; pStart.value = { x: e.clientX - panX.value, y: e.clientY - panY.value } }
function mm(e: MouseEvent) { if (isPan.value) { panX.value = e.clientX - pStart.value.x; panY.value = e.clientY - pStart.value.y } }
function mu() { isPan.value = false }

async function copyToClipboard() {
  if (!props.spriteSheetUrl) return
  try {
    const r = await fetch(props.spriteSheetUrl)
    const b = await r.blob()
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': b })])
    alert('تصویر در کلیپ‌بورد کپی شد')
  } catch { alert('خطا در کپی تصویر') }
}

function downloadJSON() {
  const json = JSON.stringify({
    frames: props.frames.map((_, i) => ({
      filename: `frame_${i}.png`,
      frame: { x: (i % props.columns) * props.frameWidth, y: Math.floor(i / props.columns) * props.frameHeight, w: props.frameWidth, h: props.frameHeight },
    })),
    meta: { totalFrames: props.frames.length, columns: props.columns, frameWidth: props.frameWidth, frameHeight: props.frameHeight },
  }, null, 2)
  const b = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(b)
  const a = document.createElement('a')
  a.href = url; a.download = 'spritesheet.json'; a.click()
  URL.revokeObjectURL(url)
}

watch(() => props.spriteSheetUrl, (v) => {
  if (v) {
    const img = new Image()
    img.onload = () => fitToVp()
    img.src = v
  }
})

const colOpts = [2, 4, 6, 8]
</script>

<template>
  <div class="panel">
    <div class="panel-header">
      <h3 class="title">اسپرایت شیت</h3>
      <button class="btn gen-btn" :disabled="frames.length < 2" @click="emit('generate')">
        ساخت اسپرایت شیت
      </button>
    </div>

    <div class="settings">
      <div class="sg">
        <label class="lbl">ستون‌ها</label>
        <div class="btns">
          <button v-for="c in colOpts" :key="c" class="btn btn-xs" :class="{ active: columns === c }" @click="emit('update:columns', c)">{{ c }}</button>
        </div>
      </div>
      <div class="sg">
        <label class="lbl">کیفیت</label>
        <select class="sel" :value="quality" @change="emit('update:quality', +($event.target as HTMLSelectElement).value)">
          <option :value="25">۲۵٪</option><option :value="50">۵۰٪</option><option :value="75">۷۵٪</option><option :value="100">۱۰۰٪</option>
        </select>
      </div>
    </div>

    <div v-if="spriteSheetUrl" class="viewport-wrap">
      <div class="zoom-bar">
        <button class="zbtn" @click="zo" title="کوچک">−</button>
        <span class="zlvl">{{ zoom !== null ? Math.round(zoom * 100) : '—' }}%</span>
        <button class="zbtn" @click="zi" title="بزرگ">+</button>
        <button class="zbtn" @click="rst" title="تنظیم در ابعاد">⟲</button>
      </div>
      <div ref="vpRef" class="viewport" :class="{ pan: isPan }" @mousedown="md" @mousemove="mm" @mouseup="mu" @mouseleave="mu">
        <img :src="spriteSheetUrl" alt="Sprite Sheet" class="sprite" draggable="false"
          :style="{
            transform: zoom !== null ? `translate(${panX}px,${panY}px) scale(${zoom})` : 'none',
            cursor: isPan ? 'grabbing' : 'grab',
          }" />
      </div>
      <div class="meta">
        <span>{{ frameWidth }}×{{ frameHeight }}</span>
        <span>{{ spriteFrameCount }} فریم</span>
        <span>{{ columns }} ستون</span>
      </div>

      <div class="export-actions">
        <a :href="spriteSheetUrl" download="spritesheet.png" class="btn download-btn">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          دانلود PNG
        </a>
        <button class="btn download-btn" @click="copyToClipboard">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          کپی
        </button>
        <button class="btn download-btn" @click="downloadJSON">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          JSON
        </button>
      </div>
    </div>

    <div v-else-if="frames.length < 2" class="empty">
      <p>حداقل ۲ فریم انتخاب کنید</p>
    </div>
    <div v-else class="empty">
      <p>برای ساخت اسپرایت شیت کلیک کنید</p>
    </div>
  </div>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.panel-header {
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
.gen-btn { padding: 0.45rem 1rem; }
.settings {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.sg {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.lbl {
  font-size: 0.75rem;
  color: var(--text-secondary);
}
.btns { display: flex; gap: 0.2rem; }
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
.btn:hover { background: var(--surface-hover); }
.btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }
.btn-xs { padding: 0.25rem 0.55rem; font-size: 0.75rem; }
.sel {
  padding: 0.3rem 0.4rem; border: 1px solid var(--border); border-radius: 6px;
  background: var(--surface); color: var(--text); font-size: 0.8rem;
}
.sel:focus { outline: none; border-color: var(--accent); }
.viewport-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.zoom-bar {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.zbtn {
  width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--border); border-radius: 6px; background: var(--surface);
  color: var(--text); cursor: pointer; font-size: 0.9rem;
}
.zbtn:hover { background: var(--surface-hover); }
.zlvl { font-size: 0.8rem; color: var(--text-secondary); min-width: 44px; text-align: center; }
.viewport {
  width: 100%; height: 380px; overflow: hidden; border-radius: 12px;
  border: 1px solid var(--border); background: var(--checkerboard); position: relative;
}
.viewport.pan { cursor: grabbing; }
.sprite {
  max-width: none; display: block; transform-origin: 0 0;
  user-select: none; -webkit-user-drag: none;
}
.meta {
  display: flex; gap: 0.75rem; font-size: 0.78rem; color: var(--text-secondary);
}
.export-actions {
  display: flex; flex-wrap: wrap; gap: 0.5rem;
}
.download-btn {
  display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.45rem 0.9rem;
  background: var(--accent); color: #fff; border-color: var(--accent); font-weight: 500;
  text-decoration: none;
}
.download-btn:hover { opacity: 0.9; }
.empty {
  text-align: center; padding: 2rem; color: var(--text-muted);
  border: 1px dashed var(--border); border-radius: 12px;
}
.empty p { margin: 0; }
</style>
