import { readdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';

const root = new URL('../', import.meta.url);
const ignore = new Set(['node_modules', '.git', 'dist']);
const targets = [];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (ignore.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full);
      continue;
    }
    if (entry.isFile() && (full.endsWith('.mjs') || full.endsWith('.js'))) targets.push(full);
  }
}

async function runCheck(file) {
  await new Promise((resolve, reject) => {
    const proc = spawn(process.execPath, ['--check', file], { stdio: 'inherit' });
    proc.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`Syntax check failed: ${file}`))));
  });
}

await walk(new URL('.', root).pathname);
for (const file of targets) {
  await runCheck(file);
}
console.log(`Syntax check passed for ${targets.length} files.`);
