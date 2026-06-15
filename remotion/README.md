# Vetra Highlight Editor (Remotion)

Turns a YouTube video into 5 highlight clips with **Remotion-rendered karaoke
captions** (TikTok style: active word highlighted, black stroke). No intro/outro
cards — each output is just the clip + captions.

## Why render locally

The Higgsfield clipper always burns its own subtitles into the picture, so to
get clean Remotion captions we cut the clips ourselves from the source video.
Downloading the source needs `yt-dlp`, and **YouTube blocks anonymous `yt-dlp`
from CI / datacenter IPs** ("Sign in to confirm you're not a bot"). Your own
machine (a residential IP) is not blocked, so the pipeline runs cleanly locally.

## Prerequisites

- **Node 18+**
- **ffmpeg** on your PATH — https://ffmpeg.org/download.html
- **yt-dlp** on your PATH — https://github.com/yt-dlp/yt-dlp#installation
  (a recent version; you may also want `deno` installed, which yt-dlp uses for
  some YouTube formats)

## 1. Pick the clips

Edit `src/clips.data.json`:

```json
{
  "orientation": "horizontal",          // "vertical" for 9:16 Shorts
  "source": "https://youtu.be/VIDEO_ID",
  "clips": [
    {"id": "clip-01", "title": "…", "start": "00:03:12", "end": "00:03:36"},
    {"id": "clip-02", "title": "…", "start": 412,        "end": 437}
  ]
}
```

`start`/`end` are seconds (numbers) or `"HH:MM:SS"` / `"MM:SS"`. Pick the
moments you want — the output length of each clip is `end - start`.

## 2. Run the pipeline

```bash
cd remotion
npm install
npm run prepare:clips   # yt-dlp downloads source → ffmpeg cuts public/clips/<id>.mp4
npm run transcribe      # Whisper → public/captions/<id>.json
npm run render:all      # → out/clip-01.mp4 … out/clip-05.mp4
```

Or preview/tweak interactively first:

```bash
npm run dev             # Remotion Studio at http://localhost:3000
```

## Customizing captions

`CAPTION_MODEL` env var picks the Whisper model (default `base.en`; try
`medium.en` for higher accuracy, slower). Caption style, font (Bebas Neue) and
the accent color (`BRAND.accent`) live in `src/Captions.tsx` and `src/clips.ts`.
Fonts scale with frame width, so the same look works in 9:16 and 16:9.

## CI (optional)

`.github/workflows/render-highlights.yml` runs the same pipeline on GitHub
Actions but is **manual only** and requires authenticating yt-dlp with a
`YOUTUBE_COOKIES` secret (see the comment at the top of that file).
