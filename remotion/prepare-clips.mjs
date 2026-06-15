// Option B: download the source video and cut clean (subtitle-free) clips from
// it, so Remotion can render its own karaoke captions on top.
//
// 1. yt-dlp downloads `source` from clips.data.json → public/source.mp4
// 2. ffmpeg cuts each clip's [start, end] → public/clips/<id>.mp4 (re-encoded)
//
// Requires `yt-dlp` and `ffmpeg` on PATH (the CI workflow installs both).
// Usage: npm run prepare
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync} from 'node:fs';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, 'public');
const CLIPS_DIR = path.join(PUBLIC, 'clips');
const SOURCE = path.join(PUBLIC, 'source.mp4');

const toSeconds = (t) => {
  if (typeof t === 'number') return t;
  return t.split(':').map(Number).reduce((acc, n) => acc * 60 + n, 0);
};

const run = (file, args) =>
  execFileSync(file, args, {stdio: 'inherit', cwd: __dirname});

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

// 2. Cut each clip (fast, accurate seek with re-encode).
for (const clip of data.clips) {
  const start = toSeconds(clip.start);
  const dur = Math.max(0.1, toSeconds(clip.end) - start);
  const out = path.join(CLIPS_DIR, `${clip.id}.mp4`);
  console.log(`\n=== Cutting ${clip.id}: ${start}s for ${dur}s ===`);
  run('ffmpeg', [
    '-y',
    '-ss', String(start),
    '-i', SOURCE,
    '-t', String(dur),
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20',
    '-c:a', 'aac', '-ac', '2',
    '-movflags', '+faststart',
    out,
  ]);
}

console.log('\nAll clips cut to public/clips/.');
