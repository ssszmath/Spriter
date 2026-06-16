import { ref, computed } from 'vue'

export interface FrameData {
  id: number
  canvas: HTMLCanvasElement
  time: number
  selected: boolean
}

export interface VideoInfo {
  duration: number
  width: number
  height: number
}

function computeHistogram(imageData: ImageData): number[] {
  const data = imageData.data
  const h = new Array(48).fill(0)
  for (let i = 0; i < data.length; i += 4) {
    h[Math.floor(data[i] / 16)]++
    h[16 + Math.floor(data[i + 1] / 16)]++
    h[32 + Math.floor(data[i + 2] / 16)]++
  }
  const total = data.length / 4
  return h.map(v => v / total)
}

function histogramDifference(a: number[], b: number[]): number {
  let diff = 0
  for (let i = 0; i < a.length; i++) diff += Math.abs(a[i] - b[i])
  return diff / a.length
}

export function useVideoProcessor() {
  const video = ref<HTMLVideoElement | null>(null)
  const videoUrl = ref<string | null>(null)
  const videoInfo = ref<VideoInfo | null>(null)
  const frames = ref<FrameData[]>([])
  const isLoading = ref(false)
  const progress = ref(0)
  const error = ref<string | null>(null)
  const extractInterval = ref(1)

  const selectedFrames = computed(() => frames.value.filter(f => f.selected))
  const selectedCount = computed(() => selectedFrames.value.length)
  const totalFrames = computed(() => frames.value.length)

  function calculateInterval(duration: number): number {
    if (duration <= 10) return 0.2
    if (duration <= 60) return 0.5
    if (duration <= 300) return 1
    return 2
  }

  function loadVideo(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file)
      const el = document.createElement('video')
      el.preload = 'metadata'
      el.muted = true
      el.playsInline = true
      el.src = url

      el.onloadedmetadata = () => {
        videoUrl.value = url
        video.value = el
        videoInfo.value = {
          duration: el.duration,
          width: el.videoWidth,
          height: el.videoHeight,
        }
        extractInterval.value = calculateInterval(el.duration)
        resolve()
      }

      el.onerror = () => {
        error.value = 'خطا در بارگذاری ویدئو'
        reject(new Error('Video load error'))
      }
    })
  }

  function getFrameAtTime(time: number): Promise<HTMLCanvasElement> {
    const el = video.value
    if (!el) throw new Error('Video not loaded')
    return new Promise(resolve => {
      el.currentTime = time
      el.onseeked = () => {
        const c = document.createElement('canvas')
        c.width = el.videoWidth
        c.height = el.videoHeight
        c.getContext('2d')!.drawImage(el, 0, 0)
        resolve(c)
      }
    })
  }

  async function extractAllFrames(interval?: number): Promise<FrameData[]> {
    if (!video.value || !videoInfo.value) {
      error.value = 'ویدئو بارگذاری نشده'
      return []
    }

    isLoading.value = true
    progress.value = 0
    error.value = null
    const result: FrameData[] = []
    const int = interval ?? extractInterval.value
    const dur = videoInfo.value.duration
    const total = Math.ceil(dur / int)
    let id = 0

    for (let t = 0; t < dur; t += int) {
      try {
        const canvas = await getFrameAtTime(t)
        result.push({ id: id++, canvas, time: t, selected: true })
      } catch {
        // skip failed frames
      }
      progress.value = Math.round((Math.min(t + int, dur) / dur) * 100)
    }

    frames.value = result
    isLoading.value = false
    progress.value = 100
    return result
  }

  function toggleFrame(id: number) {
    const f = frames.value.find(f => f.id === id)
    if (f) f.selected = !f.selected
  }

  function selectAll() {
    frames.value.forEach(f => (f.selected = true))
  }

  function deselectAll() {
    frames.value.forEach(f => (f.selected = false))
  }

  function clearFrames() {
    frames.value = []
  }

  function cleanup() {
    if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
  }

  return {
    video,
    videoUrl,
    videoInfo,
    frames,
    selectedFrames,
    selectedCount,
    totalFrames,
    isLoading,
    progress,
    error,
    extractInterval,
    loadVideo,
    extractAllFrames,
    getFrameAtTime,
    toggleFrame,
    selectAll,
    deselectAll,
    clearFrames,
    cleanup,
  }
}
