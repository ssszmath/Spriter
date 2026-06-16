import { ref } from 'vue'
import type { FrameData } from './useVideoProcessor'

export function useSpriteGenerator() {
  const spriteSheetUrl = ref<string | null>(null)
  const columns = ref(4)
  const quality = ref(100)
  const frameWidth = ref(0)
  const frameHeight = ref(0)
  const spriteFrameCount = ref(0)
  const spriteWidth = ref(0)
  const spriteHeight = ref(0)

  async function generate(frames: FrameData[], cols: number): Promise<string | null> {
    if (frames.length === 0) return null

    const q = quality.value / 100
    cols = Math.min(cols, frames.length)
    const rows = Math.ceil(frames.length / cols)
    const fw = Math.round(frames[0].canvas.width * q)
    const fh = Math.round(frames[0].canvas.height * q)
    const sw = cols * fw
    const sh = rows * fh

    const canvas = document.createElement('canvas')
    canvas.width = sw
    canvas.height = sh
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    let x = 0
    let y = 0
    for (const frame of frames) {
      ctx.drawImage(frame.canvas, x, y, fw, fh)
      x += fw
      if (x >= sw) {
        x = 0
        y += fh
      }
    }

    const url = canvas.toDataURL('image/png')
    spriteSheetUrl.value = url
    columns.value = cols
    frameWidth.value = fw
    frameHeight.value = fh
    spriteFrameCount.value = frames.length
    spriteWidth.value = sw
    spriteHeight.value = sh

    return url
  }

  function getFrameCoords(): Array<{ x: number; y: number; w: number; h: number }> {
    if (!spriteSheetUrl.value) return []
    const coords: Array<{ x: number; y: number; w: number; h: number }> = []
    let x = 0
    let y = 0
    for (let i = 0; i < spriteFrameCount.value; i++) {
      coords.push({ x, y, w: frameWidth.value, h: frameHeight.value })
      x += frameWidth.value
      if (x >= spriteWidth.value) {
        x = 0
        y += frameHeight.value
      }
    }
    return coords
  }

  function getSpriteSheetJSON() {
    const coords = getFrameCoords()
    return JSON.stringify(
      {
        frames: coords.map((c, i) => ({
          filename: `frame_${i}.png`,
          frame: { x: c.x, y: c.y, w: c.w, h: c.h },
          rotated: false,
          trimmed: false,
          spriteSourceSize: { x: c.x, y: c.y, w: c.w, h: c.h },
          sourceSize: { w: c.w, h: c.h },
        })),
        meta: {
          app: 'Spriter',
          version: '1.0',
          image: 'spritesheet.png',
          size: { w: spriteWidth.value, h: spriteHeight.value },
          scale: 1,
          frameWidth: frameWidth.value,
          frameHeight: frameHeight.value,
          columns: columns.value,
          totalFrames: spriteFrameCount.value,
        },
      },
      null,
      2,
    )
  }

  return {
    spriteSheetUrl,
    columns,
    quality,
    frameWidth,
    frameHeight,
    spriteFrameCount,
    spriteWidth,
    spriteHeight,
    generate,
    getSpriteSheetJSON,
  }
}
