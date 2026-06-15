// Single source of truth for the clip list is src/clips.data.json — it is read
// by the Remotion compositions (here), by transcribe.mjs (Whisper captions) and
// by render-all.mjs, so there is only one place to edit per run.
//
// `src` points at the Higgsfield CDN. Remotion fetches it at render time, so the
// render must run where that host is reachable (GitHub Actions, or your machine).
// transcribe.mjs downloads each clip and writes word-level caption timings to
// public/captions/<id>.json, which the Captions overlay renders on top.

import data from './clips.data.json';

export type Clip = {
  id: string;
  /** Headline shown on the intro card. */
  title: string;
  /** Short kicker line shown above the title. */
  kicker: string;
  /** Source video URL (or staticFile path if you downloaded the clips). */
  src: string;
};

export type Orientation = 'vertical' | 'horizontal';

export const CLIPS: Clip[] = data.clips;
export const ORIENTATION: Orientation = data.orientation as Orientation;

/** staticFile path of the caption timings produced by transcribe.mjs. */
export const captionsFile = (id: string) => `captions/${id}.json`;

// Channel branding shown on intro/outro cards. Tweak freely.
export const BRAND = {
  channel: 'YOUR CHANNEL',
  cta: 'SUBSCRIBE FOR MORE',
  accent: '#FFC400',
};

// Timing (frames at 30fps).
export const FPS = 30;

const DIMENSIONS: Record<Orientation, {width: number; height: number}> = {
  vertical: {width: 1080, height: 1920},
  horizontal: {width: 1920, height: 1080},
};

export const WIDTH = DIMENSIONS[ORIENTATION].width;
export const HEIGHT = DIMENSIONS[ORIENTATION].height;

export const INTRO_FRAMES = 60; // 2s title card
export const OUTRO_FRAMES = 75; // 2.5s subscribe card
export const FALLBACK_CLIP_FRAMES = 30 * 30; // 30s, used only if duration can't be probed
