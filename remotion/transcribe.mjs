// Transcribes the locally-cut clips (public/clips/<id>.mp4, produced by
// prepare-clips.mjs) with Whisper.cpp and writes word-level caption timings to
// public/captions/<id>.json — consumed by the Remotion <Captions> overlay.
//
// Run AFTER prepare-clips.mjs. Usage: npm run transcribe
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  downloadWhisperModel,
  installWhisperCpp,
  toCaptions,
  transcribe,
} from '@remotion/install-whisper-cpp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WHISPER_PATH = path.join(__dirname, 'whisper.cpp');
const WHISPER_VERSION = '1.5.5';
const MODEL = process.env.CAPTION_MODEL ?? 'base.en';

const PUBLIC = path.join(__dirname, 'public');
const CLIPS_DIR = path.join(PUBLIC, 'clips');
const CAPTIONS_DIR = path.join(PUBLIC, 'captions');

const run = (file, args) =>
  execFileSync(file, args, {stdio: 'inherit', cwd: __dirname});

async function main() {
  const data = JSON.parse(
    readFileSync(path.join(__dirname, 'src', 'clips.data.json'), 'utf8')
  );

  if (!existsSync(CAPTIONS_DIR)) mkdirSync(CAPTIONS_DIR, {recursive: true});

  console.log(`Installing Whisper.cpp (${WHISPER_VERSION})…`);
  await installWhisperCpp({to: WHISPER_PATH, version: WHISPER_VERSION});
  console.log(`Downloading model ${MODEL}…`);
  await downloadWhisperModel({folder: WHISPER_PATH, model: MODEL});

  for (const clip of data.clips) {
    console.log(`\n=== Transcribing ${clip.id} ===`);
    const mp4 = path.join(CLIPS_DIR, `${clip.id}.mp4`);
    const wav = path.join(CLIPS_DIR, `${clip.id}.wav`);
    if (!existsSync(mp4)) {
      throw new Error(`Missing ${mp4}. Run "npm run prepare" first.`);
    }

    // Extract 16kHz mono wav using Remotion's bundled ffmpeg.
    run('npx', ['remotion', 'ffmpeg', '-i', mp4, '-ar', '16000', '-ac', '1', wav, '-y']);

    const whisperCppOutput = await transcribe({
      inputPath: wav,
      whisperPath: WHISPER_PATH,
      whisperCppVersion: WHISPER_VERSION,
      model: MODEL,
      tokenLevelTimestamps: true,
    });

    const {captions} = toCaptions({whisperCppOutput});
    const out = path.join(CAPTIONS_DIR, `${clip.id}.json`);
    writeFileSync(out, JSON.stringify(captions, null, 2));
    console.log(`Wrote ${captions.length} captions → ${path.relative(__dirname, out)}`);
  }

  console.log('\nAll clips transcribed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
