# Vetra — project guide for Claude

This repo holds the **VetraEstate** static website (root `*.html`, `style.css`,
`script.js`, `images/`) **and** an automated **YouTube highlight pipeline** under
`remotion/` + `.github/workflows/render-highlights.yml`.

## Standing task: clip pipeline (LOCKED — user's standard)

When the user gives a video link (YouTube / YouTube Live) and asks for clips,
run this end-to-end **without re-asking** unless they say otherwise. The locked
standard is: **10 clean clips, 16:9, each under a minute, NO subtitles.**

   **Why not the Higgsfield clipper?** `personal_clipper_create` always burns
   subtitles into the picture (the `subtitle_font` arg has no "off" — omit it and
   it defaults to Noto Sans), and it has no clip-length control. The user wants
   clean, subtitle-free clips, so we cut them from the source ourselves instead.

1. **Set the source.** Edit `remotion/src/clips.data.json` (the single source of
   truth): set `source` to the video URL. Keep `orientation: "horizontal"`,
   `clipCount: 10`, `clipLength: 55`, and `clips: []` (empty → auto-slice). Only
   add explicit `{id, title, start, end}` entries to `clips` if the user asks for
   specific moments. Verify with `cd remotion && npx tsc --noEmit`.

2. **Cut LOCALLY (the default path).** YouTube blocks anonymous `yt-dlp` from CI
   runner IPs ("Sign in to confirm you're not a bot"), and this sandbox blocks
   YouTube + has no ffmpeg — so neither can download/cut. The user runs it on
   their own machine (residential IP works):
   ```bash
   cd remotion && npm install
   npm run prepare:clips   # → public/clips/clip-01.mp4 … clip-10.mp4 (clean 16:9)
   ```
   `prepare-clips.mjs` downloads the source with yt-dlp, probes its duration with
   ffprobe, and auto-slices `clipCount` evenly-spaced clips of up to `clipLength`
   seconds, each scaled+padded to 1920×1080. **These clips ARE the deliverable**
   — no `transcribe` / `render:all` step (those only add Remotion captions, which
   the standard turns off). Commit + push the updated `clips.data.json`.

   The `render-highlights.yml` workflow is **manual-only** and needs a
   `YOUTUBE_COOKIES` secret to authenticate yt-dlp — only suggest CI if the user
   wants it and will provide cookies.

   _Captions are off by default. If the user ever asks for burned-in karaoke
   captions, the older Remotion path still exists: `npm run transcribe` then
   `npm run render:all` (see `src/Captions.tsx`)._

3. **Deliver.** The clips render on the user's machine (`public/clips/*.mp4`), so
   there's nothing to link from here — confirm the run and where the files land.
   If a run ever happens via CI, post the **Actions run page link** (artifact
   `highlight-videos`) directly in chat.


### Editing style

By default the output is the **clean clip** (no overlays, no subtitles, no
intro/outro). The optional Remotion caption path adds **karaoke captions** on top
(TikTok style: active word highlighted in the accent color, black stroke) — only
used if the user explicitly asks for burned-in captions.

Captions come from `transcribe.mjs`: it takes each locally-cut clip
(`public/clips/<id>.mp4` from `prepare-clips.mjs`), extracts a 16kHz mono wav via
Remotion's bundled ffmpeg, runs Whisper.cpp (`base.en` by default, override with
`CAPTION_MODEL`), and writes word-level timings to
`public/captions/<id>.json`. The `<Captions>` overlay (`src/Captions.tsx`)
renders them with `@remotion/captions` `createTikTokStyleCaptions`; caption
style/font and the accent color (`BRAND.accent`) live in `src/Captions.tsx` and
`src/clips.ts`. Fonts are sized relative to frame width, so it works in both
9:16 and 16:9. If a clip's caption JSON is missing, the overlay renders nothing.

## Branch

Work on `claude/youtube-shorts-highlights-a69wfs`. Commit + push there; do not
open a PR unless asked.
