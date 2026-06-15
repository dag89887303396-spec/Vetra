# Vetra — project guide for Claude

This repo holds the **VetraEstate** static website (root `*.html`, `style.css`,
`script.js`, `images/`) **and** an automated **YouTube highlight pipeline** under
`remotion/` + `.github/workflows/render-highlights.yml`.

## Standing task: highlight clip pipeline

When the user gives a video link (YouTube / YouTube Live) and asks to cut
clips / shorts / highlights, run this end-to-end **without re-asking the locked
settings below** unless they say otherwise:

   **Why not the Higgsfield clipper?** `personal_clipper_create` always burns
   subtitles into the picture (the `subtitle_font` arg can't be disabled — omit
   it and it defaults to Noto Sans). Since we now render captions in Remotion,
   we cut clean clips from the source instead.

1. **Find the highlight moments.** Use `video_analysis_create({youtube_url})`
   (poll `video_analysis_status`) to get the scene-by-scene breakdown with
   timecodes, then pick the **5** best highlight moments (start/end). Warn the
   user that analysis accuracy drops on long videos. (This MCP tool may require
   the user to approve it.)

2. **Wire into Remotion.** Edit `remotion/src/clips.data.json` (the single
   source of truth — read by the compositions, `prepare-clips.mjs`,
   `transcribe.mjs` and `render-all.mjs`):
   - `orientation`: `'vertical'` for 9:16, `'horizontal'` for 16:9 (default).
   - `source`: the YouTube URL.
   - `clips`: 5 entries `{id: "clip-0N", title, start, end}` where start/end are
     seconds or `"HH:MM:SS"` of the chosen moments.
   Verify with `cd remotion && npx tsc --noEmit`.

3. **Render LOCALLY (the default path).** YouTube blocks anonymous `yt-dlp`
   from CI runner IPs ("Sign in to confirm you're not a bot"), and this sandbox
   blocks YouTube + has no Chromium/ffmpeg — so neither can download/render. The
   user runs it on their own machine (residential IP works):
   ```bash
   cd remotion && npm install
   npm run prepare:clips   # yt-dlp downloads source, ffmpeg cuts public/clips/<id>.mp4
   npm run transcribe      # Whisper → public/captions/<id>.json
   npm run render:all      # → out/clip-0N.mp4
   ```
   Commit + push the updated `remotion/src/clips.data.json` so the config is
   saved. The `render-highlights.yml` workflow is **manual-only** and needs a
   `YOUTUBE_COOKIES` secret to authenticate yt-dlp — only suggest CI if the user
   wants it and will provide cookies.

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
**No intro/outro cards** (removed per request). Each clip's length is `end -
start` from its timecodes in `clips.data.json`.

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
