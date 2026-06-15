// Renders every highlight composition to ./out/<id>.mp4
// Usage: npm run render:all
import {execSync} from 'node:child_process';

// Keep in sync with the ids in src/clips.ts
const IDS = ['clip-01', 'clip-02', 'clip-03', 'clip-04', 'clip-05'];

for (const id of IDS) {
  console.log(`\n=== Rendering ${id} ===`);
  execSync(`npx remotion render ${id} out/${id}.mp4`, {stdio: 'inherit'});
}

console.log('\nAll clips rendered to ./out/');
