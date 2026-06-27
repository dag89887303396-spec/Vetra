// NON-generative Reel enhancement (step 1 of 2).
//
// Cleans the ORIGINAL vertical video with ffmpeg — no AI, no regeneration, the
// person/words/movement are never touched — and produces:
//   public/reel/enhanced.mp4   (1080x1920, sharper, denoised, graded, voice cleaned)
//   public/sfx/whoosh.wav      (soft appearance SFX used by the captions)
//
// Then render the captions/graphics overlay on top:
//   npx remotion render ReelEdit out/reel.mp4
//
// Usage:
//   node enhance-reel.mjs [path/to/input.mov]
//   (default input: public/reel-input/input.mov)
//
// Requires ffmpeg on PATH.
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, 'public');
const REEL_DIR = path.join(PUBLIC, 'reel');
const SFX_DIR = path.join(PUBLIC, 'sfx');

const input = path.resolve(
  process.argv[2] ?? path.join(PUBLIC, 'reel-input', 'input.mov')
);
const enhanced = path.join(REEL_DIR, 'enhanced.mp4');
const whoosh = path.join(SFX_DIR, 'whoosh.wav');

if (!existsSync(input)) {
  console.error(
    `Input not found: ${input}\n` +
      `Put your clip there, or pass a path: node enhance-reel.mjs my-video.mov`
  );
  process.exit(1);
}
for (const d of [REEL_DIR, SFX_DIR]) {
  if (!existsSync(d)) mkdirSync(d, {recursive: true});
}

const run = (file, args) =>
  execFileSync(file, args, {stdio: 'inherit', cwd: __dirname});

// --- Picture cleanup (overlay-safe: no warping of the subject) -------------
//   hqdn3d  : denoise + remove compression blockiness
//   unsharp : add sharpness/detail
//   eq      : gentle color + contrast lift
//   deshake : LIGHT stabilization (remove the line below to keep raw motion)
//   scale/crop to a clean 1080x1920 9:16 frame
const VF = [
  'hqdn3d=1.5:1.5:6:6',
  'unsharp=5:5:0.8:3:3:0.4',
  'eq=contrast=1.06:saturation=1.12:brightness=0.01:gamma=1.02',
  'deshake',
  'scale=1080:1920:force_original_aspect_ratio=increase',
  'crop=1080:1920',
  'setsar=1',
].join(',');

// --- Audio cleanup (speech is preserved, only cleaned) ---------------------
//   highpass/lowpass : trim rumble + hiss
//   afftdn           : reduce background noise
//   loudnorm         : even, broadcast-style loudness
const AF = [
  'highpass=f=80',
  'lowpass=f=12000',
  'afftdn=nr=12',
  'loudnorm=I=-16:TP=-1.5:LRA=11',
].join(',');

console.log(`Enhancing picture + audio:\n  in:  ${input}\n  out: ${enhanced}`);
run('ffmpeg', [
  '-y',
  '-i', input,
  '-vf', VF,
  '-af', AF,
  '-r', '30',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '18',
  '-c:a', 'aac', '-b:a', '192k',
  '-movflags', '+faststart',
  enhanced,
]);

// --- Soft "airy whoosh + pop" used when each caption appears ----------------
if (!existsSync(whoosh)) {
  console.log(`Generating appearance SFX: ${whoosh}`);
  run('ffmpeg', [
    '-y',
    '-f', 'lavfi',
    '-i', 'anoisesrc=d=0.4:c=pink:r=44100:a=0.35',
    '-af',
    'highpass=f=300,lowpass=f=3500,' +
      'afade=t=in:d=0.04,afade=t=out:st=0.16:d=0.24,volume=0.5',
    whoosh,
  ]);
} else {
  console.log(`SFX already exists, reusing ${whoosh}`);
}

console.log(
  '\nDone. Now render the overlay:\n' +
    '  npx remotion render ReelEdit out/reel.mp4\n' +
    '(or `npm run dev` to preview & fine-tune caption timings in Studio)'
);
