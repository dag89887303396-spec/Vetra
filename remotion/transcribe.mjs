// Transcribes every clip with Whisper.cpp and writes word-level caption timings
// to public/captions/<id>.json — consumed by the Remotion <Captions> overlay.
//
// Runs locally and in CI (needs open internet to fetch the clips + the Whisper
// model). Usage: npm run transcribe
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
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
    await readFile(path.join(__dirname, 'src', 'clips.data.json'), 'utf8')
  );

  for (const dir of [CLIPS_DIR, CAPTIONS_DIR]) {
    if (!existsSync(dir)) mkdirSync(dir, {recursive: true});
  }

  console.log(`Installing Whisper.cpp (${WHISPER_VERSION})…`);
  await installWhisperCpp({to: WHISPER_PATH, version: WHISPER_VERSION});
  console.log(`Downloading model ${MODEL}…`);
  await downloadWhisperModel({folder: WHISPER_PATH, model: MODEL});

  for (const clip of data.clips) {
    console.log(`\n=== Transcribing ${clip.id} ===`);
    const mp4 = path.join(CLIPS_DIR, `${clip.id}.mp4`);
    const wav = path.join(CLIPS_DIR, `${clip.id}.wav`);

    // Download the clip.
    const res = await fetch(clip.src);
    if (!res.ok) throw new Error(`Download failed (${res.status}) for ${clip.src}`);
    writeFileSync(mp4, Buffer.from(await res.arrayBuffer()));

    // Extract 16kHz mono wav using Remotion's bundled ffmpeg.
    run('npx', ['remotion', 'ffmpeg', '-i', mp4, '-ar', '16000', '-ac', '1', wav, '-y']);

    // Transcribe with token-level timestamps.
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
