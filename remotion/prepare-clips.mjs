// STANDARD pipeline: download the source and cut N clean 16:9 clips (each under
// a minute, NO subtitles). These clips ARE the final deliverable — no Whisper /
// Remotion render step is needed when captions are off.
//
// 1. yt-dlp downloads `source` from clips.data.json → public/source.mp4
// 2. If clips.data.json has explicit `clips`, cut those [start,end] windows.
//    Otherwise auto-slice `clipCount` (default 10) clips of up to `clipLength`
//    seconds (default 55), evenly spaced across the whole source.
// 3. Every clip is scaled+padded to 1920x1080 (16:9) so the output is always
//    16:9 regardless of the source aspect.
//
// Requires `yt-dlp` and `ffmpeg`/`ffprobe` on PATH.
// Usage: npm run prepare:clips
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, 'public');
const CLIPS_DIR = path.join(PUBLIC, 'clips');
const SOURCE = path.join(PUBLIC, 'source.mp4');

// Output everything as 16:9 1080p; letterboxes non-16:9 sources without cropping.
const SCALE_169 =
  'scale=1920:1080:force_original_aspect_ratio=decrease,' +
  'pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black,setsar=1';

const toSeconds = (t) => {
  if (typeof t === 'number') return t;
  return t.split(':').map(Number).reduce((acc, n) => acc * 60 + n, 0);
};

const run = (file, args) =>
  execFileSync(file, args, {stdio: 'inherit', cwd: __dirname});

const probeDuration = () => {
  const out = execFileSync(
    'ffprobe',
    ['-v', 'error', '-show_entries', 'format=duration',
     '-of', 'default=noprint_wrappers=1:nokey=1', SOURCE],
    {cwd: __dirname},
  );
  return parseFloat(String(out).trim());
};

const data = JSON.parse(
  readFileSync(path.join(__dirname, 'src', 'clips.data.json'), 'utf8')
);

if (!existsSync(CLIPS_DIR)) mkdirSync(CLIPS_DIR, {recursive: true});

// 1. Download the source once.
if (!existsSync(SOURCE)) {
  console.log(`Downloading source: ${data.source}`);
  run('yt-dlp', [
    '--no-playlist',
    '-N', '4',
    '-f', 'best[ext=mp4][height<=1080]/best[ext=mp4]/best',
    '--merge-output-format', 'mp4',
    '-o', SOURCE,
    data.source,
  ]);
} else {
  console.log('Source already downloaded, reusing public/source.mp4');
}

// 2. Decide the clip windows: explicit list, or auto-slice evenly.
let clips = Array.isArray(data.clips) ? data.clips : [];
if (clips.length === 0) {
  const count = data.clipCount ?? 10;
  const maxLen = Math.min(data.clipLength ?? 55, 59); // keep every clip < 1 min
  const duration = probeDuration();
  const segment = duration / count;
  const dur = Math.max(1, Math.min(maxLen, segment));
  clips = Array.from({length: count}, (_, i) => ({
    id: `clip-${String(i + 1).padStart(2, '0')}`,
    start: Math.floor(i * segment),
    end: Math.floor(i * segment + dur),
  }));
  console.log(
    `Auto-slicing ${count} clips of ~${Math.round(dur)}s ` +
    `across ${Math.round(duration)}s of source.`
  );
}

// 3. Cut each clip to a clean 16:9 mp4.
for (const clip of clips) {
  const start = toSeconds(clip.start);
  const dur = Math.max(0.1, toSeconds(clip.end) - start);
  const out = path.join(CLIPS_DIR, `${clip.id}.mp4`);
  console.log(`\n=== Cutting ${clip.id}: ${start}s for ${Math.round(dur)}s ===`);
  run('ffmpeg', [
    '-y',
    '-ss', String(start),
    '-i', SOURCE,
    '-t', String(dur),
    '-vf', SCALE_169,
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20',
    '-c:a', 'aac', '-ac', '2',
    '-movflags', '+faststart',
    out,
  ]);
}

console.log(`\nDone — ${clips.length} clean 16:9 clips in public/clips/.`);
