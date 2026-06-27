// Single source of truth for the clip list is src/clips.data.json — read by the
// Remotion compositions (here), prepare-clips.mjs (cuts clean clips from the
// source), transcribe.mjs (Whisper captions) and render-all.mjs.
//
// Pipeline (Option B — Remotion-only subtitles):
//   prepare-clips.mjs  : yt-dlp downloads `source`, ffmpeg cuts each clip's
//                        [start,end] into public/clips/<id>.mp4 (no burned subs)
//   transcribe.mjs     : Whisper → public/captions/<id>.json
//   render             : clip (staticFile) + karaoke captions overlay

import {staticFile} from 'remotion';
import data from './clips.data.json';

export type Clip = {
  id: string;
  /** Headline (kept for reference / future use). */
  title: string;
  /** Start time in the source — seconds (number) or "HH:MM:SS" / "MM:SS". */
  start: number | string;
  /** End time in the source — seconds (number) or "HH:MM:SS" / "MM:SS". */
  end: number | string;
};

export type Orientation = 'vertical' | 'horizontal';

export const SOURCE_URL: string = data.source;
export const CLIPS: Clip[] = data.clips;
export const ORIENTATION: Orientation = data.orientation as Orientation;

/** Parse "HH:MM:SS", "MM:SS" or a number of seconds into seconds. */
export const toSeconds = (t: number | string): number => {
  if (typeof t === 'number') return t;
  const parts = t.split(':').map(Number);
  return parts.reduce((acc, n) => acc * 60 + n, 0);
};

export const clipDurationSeconds = (clip: Clip): number =>
  Math.max(0, toSeconds(clip.end) - toSeconds(clip.start));

/** staticFile path of the clip cut by prepare-clips.mjs. */
export const clipFile = (id: string) => staticFile(`clips/${id}.mp4`);
/** staticFile path of the caption timings produced by transcribe.mjs. */
export const captionsFile = (id: string) => `captions/${id}.json`;

// Karaoke caption accent + branding hook.
export const BRAND = {
  accent: '#FFC400',
};

// Timing.
export const FPS = 30;

const DIMENSIONS: Record<Orientation, {width: number; height: number}> = {
  vertical: {width: 1080, height: 1920},
  horizontal: {width: 1920, height: 1080},
};

export const WIDTH = DIMENSIONS[ORIENTATION].width;
export const HEIGHT = DIMENSIONS[ORIENTATION].height;
