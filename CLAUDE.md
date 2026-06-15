# Vetra — project guide for Claude

This repo holds the **VetraEstate** static website (root `*.html`, `style.css`,
`script.js`, `images/`) **and** an automated **YouTube highlight pipeline** under
`remotion/` + `.github/workflows/render-highlights.yml`.

## Standing task: highlight clip pipeline

When the user gives a video link (YouTube / YouTube Live) and asks to cut
clips / shorts / highlights, run this end-to-end **without re-asking the locked
settings below** unless they say otherwise:

1. **Clip with Higgsfield.** Call the Higgsfield MCP tool
   `personal_clipper_create` with:
   - `urls`: the link the user gave
   - `clips_num`: **5**
   - `clip_aspect`: **16:9** (locked default — horizontal). Use 9:16 only if the
     user explicitly asks for vertical Shorts.
   - **Do NOT pass `subtitle_font`.** Subtitles are now rendered by Remotion
     (karaoke style), so we want clips WITHOUT Higgsfield's burned-in captions.
     (`subtitle_font` is optional; omit it to avoid double subtitles. If the
     clipper still burns captions, flag it to the user.)
   Then poll `personal_clipper_status` until `status: done`. Report any clips
   that fail (the service sometimes returns `max retries exceeded`), and offer
   to re-run. Note: the clipper de-duplicates by video URL, so re-running the
   same link returns the existing job rather than re-rendering.

2. **Wire the clips into Remotion.** Edit `remotion/src/clips.data.json` (the
   single source of truth — read by the compositions, `transcribe.mjs` and
   `render-all.mjs`):
   - Set `orientation` (`'vertical'` for 9:16, `'horizontal'` for 16:9).
   - Replace `clips` with the new clips (id `clip-0N`, kicker `HIGHLIGHT 0N`,
     the Higgsfield `title`, and `src` = the returned `cdn_url`).
   Verify with `cd remotion && npx tsc --noEmit`.

3. **Render via GitHub Actions (NOT this sandbox).** This cloud sandbox cannot
   reach the Higgsfield CDN (network policy blocks the host) and has no
   Chromium/ffmpeg, so it **cannot render**. Commit + push the updated
   `remotion/` to the working branch. The `render-highlights.yml` workflow runs
   automatically on push (open internet + Chromium). It **transcribes** each clip
   with Whisper (`npm run transcribe` → `public/captions/<id>.json`), then
   renders the 5 videos and uploads them as the **`highlight-videos`** artifact.

4. **Deliver — ALWAYS post the links directly here in chat** (standing user
   request). Every time, paste into the chat reply:
   - the **Actions run page link** (artifact `highlight-videos` is at the bottom
     of that page), and
   - the raw Higgsfield `cdn_url`s as direct, clickable fallback links to each
     video.
   Never make the user go hunting for the link — it goes in the message.

### Editing style (Remotion)

Each output = **the clip** with **Remotion-rendered karaoke captions** on top
(TikTok style: active word highlighted in the accent color, black stroke).
**No intro/outro cards** (removed per request). Clip length is auto-probed via
`getVideoMetadata`, so output length == clip length.

Captions come from `transcribe.mjs`: it downloads each clip, extracts a 16kHz
mono wav via Remotion's bundled ffmpeg, runs Whisper.cpp (`base.en` by default,
override with `CAPTION_MODEL`), and writes word-level timings to
`public/captions/<id>.json`. The `<Captions>` overlay (`src/Captions.tsx`)
renders them with `@remotion/captions` `createTikTokStyleCaptions`; caption
style/font and the accent color (`BRAND.accent`) live in `src/Captions.tsx` and
`src/clips.ts`. Fonts are sized relative to frame width, so it works in both
9:16 and 16:9. If a clip's caption JSON is missing, the overlay renders nothing.

### Local render (alternative to CI)

```bash
cd remotion && npm install && npm run render:all   # → out/clip-0N.mp4
```

## Branch

Work on `claude/youtube-shorts-highlights-a69wfs`. Commit + push there; do not
open a PR unless asked.
