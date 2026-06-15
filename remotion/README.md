# Vetra Shorts Editor (Remotion)

Edits the 5 Higgsfield highlight clips (from the YouTube live stream
`https://www.youtube.com/live/rmsfWJBQVAM`) into branded YouTube videos.

Each output =**intro title card** → **the clip** (with its baked-in Bebas Neue
subtitles) → **outro "Subscribe" card**, with cross-fades between segments. The
clip's own length is detected automatically, so the timeline always matches the
source.

## Why you render this locally (not in the cloud session)

The Claude Code web sandbox that generated this project **cannot reach the
Higgsfield CDN** (network policy blocks the host) and has no Chromium/ffmpeg, so
it cannot render the videos. Your own machine can. Everything is wired up — you
just run it.

## Setup

```bash
cd remotion
npm install
```

## Preview in the visual editor

```bash
npm run dev      # opens Remotion Studio at http://localhost:3000
```

## Render all 5 videos

```bash
npm run render:all   # writes out/clip-01.mp4 … out/clip-05.mp4
```

…or one at a time:

```bash
npx remotion render clip-01 out/clip-01.mp4
```

## If your network also blocks the CDN

Download the 5 mp4s into `public/clips/` (clip_01.mp4 … clip_05.mp4), then in
`src/clips.ts` change each `src` from the CDN URL to:

```ts
import {staticFile} from 'remotion';
// ...
src: staticFile('clips/clip_01.mp4'),
```

## Customizing the branding

Edit `BRAND` in `src/clips.ts` (channel name, CTA text, accent color) and the
intro/outro durations (`INTRO_FRAMES`, `OUTRO_FRAMES`). Card layout/animation
lives in `src/HighlightVideo.tsx`.
