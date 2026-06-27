# Vetra Clipper

**Standard:** a YouTube link → **10 clean clips, 16:9, each under a minute, NO
subtitles.** The clips are cut directly from the source — that's the whole
deliverable (no captions, no Remotion render step).

## Why local

Downloading the source needs `yt-dlp`, and **YouTube blocks anonymous `yt-dlp`
from CI / datacenter IPs** ("Sign in to confirm you're not a bot"). Your own
machine (a residential IP) is not blocked, so the pipeline runs cleanly locally.

## Prerequisites

- **Node 18+**
- **ffmpeg + ffprobe** on your PATH — https://ffmpeg.org/download.html
- **yt-dlp** on your PATH — https://github.com/yt-dlp/yt-dlp#installation

## 1. Set the source

Edit `src/clips.data.json` — usually only the `source` line changes:

```json
{
  "orientation": "horizontal",
  "source": "https://www.youtube.com/live/VIDEO_ID",
  "clipCount": 10,
  "clipLength": 55,
  "clips": []
}
```

Leave `clips` empty: the script auto-slices `clipCount` evenly-spaced clips of up
to `clipLength` seconds across the whole video. To hand-pick moments instead, add
entries `{"id": "clip-01", "title": "…", "start": "00:03:12", "end": "00:03:36"}`
(seconds or `HH:MM:SS`) and they override the auto-slicer.

## 2. Cut the clips

```bash
cd remotion
npm install
npm run prepare:clips   # → public/clips/clip-01.mp4 … clip-10.mp4 (clean 16:9)
```

That's it — the files in `public/clips/` are the final clips. Every clip is
scaled+padded to 1920×1080 so the output is always 16:9.

## Optional: Remotion karaoke captions

The repo still contains the older captioned path if you ever want burned-in
TikTok-style karaoke captions instead of clean clips:

```bash
npm run transcribe      # Whisper → public/captions/<id>.json
npm run render:all      # → out/clip-0N.mp4 (clip + captions overlay)
```

Caption style/font and accent color live in `src/Captions.tsx` and `src/clips.ts`.

## CI (optional)

`.github/workflows/render-highlights.yml` runs on GitHub Actions but is **manual
only** and needs a `YOUTUBE_COOKIES` secret to authenticate yt-dlp (see the
comment at the top of that file).
