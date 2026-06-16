# Spriter

> A modern single-page application for extracting frames from videos and generating sprite sheets. Built with Vue 3, TypeScript, and Vite.

![screenshot](https://img.shields.io/badge/status-active-brightgreen)
![Vue](https://img.shields.io/badge/Vue-3-4FC08D)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)
![Vite](https://img.shields.io/badge/Vite-5-646CFF)

---

## Features

- **Video upload** — drag & drop or click to select (MP4, WebM, Ogg)
- **Auto frame extraction** — all frames extracted automatically on upload (smart interval based on video duration)
- **Interactive frame gallery** — scrollable grid of thumbnails with select/deselect, select all, deselect all
- **Animation preview** — play selected frames as a looping animation with speed control
- **Sprite sheet generation** — configurable columns (2–8) and quality (25%–100%)
- **Pan & zoom** — drag to pan, buttons to zoom in/out, auto-fit to viewport
- **Export** — download PNG, copy to clipboard, export frame coordinates as JSON
- **Scene detection** — histogram-based keyframe detection
- **Dark / light theme** — toggle in header
- **Responsive** — works on desktop and mobile

## Quick Start

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser.

## Build

```bash
npm run build
```

Output is written to `dist/`.

## Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── VideoUploader.vue      # Drag & drop upload zone
│   ├── FrameGallery.vue        # Thumbnail grid with selection
│   ├── AnimationPreview.vue    # Looping animation player
│   └── SpriteSheetPanel.vue    # Sprite sheet view + export
├── composables/
│   ├── useVideoProcessor.ts    # Video loading, frame extraction, scene detection
│   └── useSpriteGenerator.ts   # Canvas-based sprite sheet assembly
├── App.vue                     # Root layout, state orchestration, theming
└── main.ts                     # App entry point
```

## How It Works

1. **Upload** — drop a video file onto the upload zone. The app reads it with the browser's native `<video>` API.
2. **Extract** — frames are extracted at a calculated interval (0.2s–2s depending on video length). Each frame is drawn onto an off-screen `<canvas>`.
3. **Select** — click thumbnails to toggle selection. Only selected frames are used for animation and sprite sheet.
4. **Animate** — preview selected frames in sequence with adjustable speed (1–24 FPS).
5. **Generate** — build a sprite sheet by drawing all selected frames onto a single canvas in a grid layout.
6. **Export** — download the sprite sheet as PNG, copy the image to your clipboard, or export frame metadata as JSON.

## Tech Stack

| Tool | Purpose |
|------|---------|
| Vue 3 | UI framework (Composition API, `<script setup>`) |
| TypeScript | Type safety |
| Vite | Build tool and dev server |
| HTML Canvas API | Frame extraction and sprite sheet assembly |
| File / Video APIs | Browser-native media handling |

No external UI libraries or heavy dependencies.

## License

MIT
