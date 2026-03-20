#!/usr/bin/env node
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(scriptDir, '..');
const runtimeRoot = path.resolve(skillRoot, 'vendor/cover-edit');
const callerCwd = process.cwd();
const rawArgs = process.argv.slice(2);
const pathFlags = new Set(['--source', '--spec', '--out-dir', '--hero']);

function absolutizeCliArgs(args) {
  const out = [];
  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    out.push(token);
    if (!pathFlags.has(token)) continue;
    const value = args[index + 1];
    if (!value) continue;
    const resolved = path.isAbsolute(value) ? value : path.resolve(callerCwd, value);
    out.push(resolved);
    index += 1;
  }
  return out;
}

const forwardedArgs = absolutizeCliArgs(rawArgs);

if (!forwardedArgs.includes('--source') && !forwardedArgs.includes('--spec')) {
  console.error(`signal-cover-studio

Usage:
  node scripts/run_cover_workflow.mjs --source <file> [--out-dir <dir>] [--strict]
  node scripts/run_cover_workflow.mjs --spec <file> [--out-dir <dir>] [--strict]
`);
  process.exit(1);
}

const args = ['./bin/cover-edit.mjs', 'workflow', ...forwardedArgs];
if (!forwardedArgs.includes('--out-dir')) {
  args.push('--out-dir', path.resolve(callerCwd, 'dist/skill-runs/latest'));
}

const child = spawn(process.execPath, args, {
  cwd: runtimeRoot,
  stdio: 'inherit'
});

child.on('exit', (code) => {
  process.exit(code ?? 1);
});
