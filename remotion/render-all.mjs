// Renders every clip composition to ./out/<id>.mp4
// Usage: npm run render:all   (run `npm run transcribe` first for captions)
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(
  readFileSync(path.join(__dirname, 'src', 'clips.data.json'), 'utf8')
);

for (const {id} of data.clips) {
  console.log(`\n=== Rendering ${id} ===`);
  execFileSync('npx', ['remotion', 'render', id, `out/${id}.mp4`], {
    stdio: 'inherit',
    cwd: __dirname,
  });
}

console.log('\nAll clips rendered to ./out/');
