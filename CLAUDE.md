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
   - `clip_aspect`: **9:16** (locked default — vertical Shorts). Use 16:9 only
     if the user explicitly asks for horizontal.
   - `subtitle_font`: **Bebas Neue**
   Then poll `personal_clipper_status` until `status: done`. Report any clips
   that fail (the service sometimes returns `max retries exceeded`), and offer
   to re-run. Note: the clipper de-duplicates by video URL, so re-running the
   same link returns the existing job rather than re-rendering.

2. **Wire the clips into Remotion.** Edit `remotion/src/clips.ts`:
   - Replace `CLIPS` with the new clips (id, kicker `HIGHLIGHT 0N`, the
     Higgsfield `title`, and `src` = the returned `cdn_url`).
   - Set `ORIENTATION` to match the clip aspect (`'vertical'` for 9:16,
     `'horizontal'` for 16:9).
   - Keep the id list in `remotion/render-all.mjs` in sync with the ids.
   Verify with `cd remotion && npx tsc --noEmit`.

3. **Render via GitHub Actions (NOT this sandbox).** This cloud sandbox cannot
   reach the Higgsfield CDN (network policy blocks the host) and has no
   Chromium/ffmpeg, so it **cannot render**. Commit + push the updated
   `remotion/` to the working branch. The `render-highlights.yml` workflow runs
   automatically on push (it has open internet + installs Chromium), renders the
   5 edited videos, and uploads them as the **`highlight-videos`** artifact.

4. **Deliver.** Give the user the Actions run link / artifact, and the raw
   Higgsfield `cdn_url`s as a fallback. They download the edited mp4s from the
   workflow artifact.

### Editing style (Remotion)

Each output = branded **intro title card** (kicker + Higgsfield title) →
**the clip** (its Bebas Neue subtitles are already baked in by Higgsfield) →
**outro "Subscribe" card**, with cross-fades. Clip length is auto-probed via
`getVideoMetadata`. Branding (channel name, CTA, accent color), card layout and
durations live in `remotion/src/clips.ts` (`BRAND`, `*_FRAMES`) and
`remotion/src/HighlightVideo.tsx`. Fonts are sized relative to frame width, so
the same components work in both 9:16 and 16:9.

### Local render (alternative to CI)

```bash
cd remotion && npm install && npm run render:all   # → out/clip-0N.mp4
```

## Branch

Work on `claude/youtube-shorts-highlights-a69wfs`. Commit + push there; do not
open a PR unless asked.
