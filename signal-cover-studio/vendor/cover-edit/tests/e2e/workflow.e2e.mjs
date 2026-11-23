// End-to-end: run the skill's entry script and check what the README says comes out.
// Needs Chromium (npx playwright install chromium) and, on Linux, fonts-noto-cjk.
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const entry = path.resolve(root, '../../scripts/run_cover_workflow.mjs');
const example = path.join(root, 'examples/content/fundraising.md');

// COVER_E2E_OUT lets CI keep the images as an artifact.
async function outDir(name) {
  return process.env.COVER_E2E_OUT
    ? path.join(process.env.COVER_E2E_OUT, name)
    : mkdtemp(path.join(os.tmpdir(), `cover-e2e-${name}-`));
}

async function run(dir, ...flags) {
  try {
    await promisify(execFile)(process.execPath, [entry, '--source', example, '--out-dir', dir, ...flags], { cwd: os.tmpdir() });
    return { ok: true };
  } catch (error) {
    return { ok: false, message: error.stderr?.split('\n')[0] || error.message };
  }
}

// validation.json is written before a strict run stops, so it is there after a failure too.
async function issues(dir) {
  const report = JSON.parse(await readFile(path.join(dir, 'validation.json'), 'utf8'));
  return report.validations.flatMap((item) => item.issues.map((issue) => ({ target: item.targetId, ...issue })));
}

async function pngSize(file) {
  const bytes = await readFile(file);
  assert.equal(bytes.subarray(1, 4).toString('latin1'), 'PNG', `${file} is not a PNG`);
  return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
}

async function assertBundle(dir) {
  assert.deepEqual(await pngSize(path.join(dir, 'wechat-cover.png')), [900, 383]);
  assert.deepEqual(await pngSize(path.join(dir, 'xhs-cover.png')), [1200, 1600]);
  assert.deepEqual(await pngSize(path.join(dir, 'x-post.png')), [1600, 1200]);
  assert.match(await readFile(path.join(dir, 'wechat-article.html'), 'utf8'), /<html/i);
  const manifest = JSON.parse(await readFile(path.join(dir, 'manifest.json'), 'utf8'));
  assert.equal(manifest.outputs.length, 4);
  JSON.parse(await readFile(path.join(dir, 'project.spec.json'), 'utf8'));
}

// The example's own title and summary are overridden with shorter text: whether the original
// wording fits depends on the fonts installed (it overflows on Ubuntu with fonts-noto-cjk),
// and the renderer refuses to draw a layer that overflows, with or without --strict.
test('the example article becomes three covers and one HTML file at the documented sizes', async () => {
  const dir = await outDir('strict-pass');
  const result = await run(dir, '--strict', '--title', 'Investor Fit', '--subtitle', 'Define. Profile. Search.', '--summary', 'Match, do not spray.');
  assert.ok(result.ok, `${result.message}\n${JSON.stringify(await issues(dir).catch(() => []), null, 2)}`);
  await assertBundle(dir);
  assert.deepEqual((await issues(dir)).filter((issue) => issue.level === 'error'), []);
});

test('a strict run stops before rendering when the text cannot fit', async () => {
  const dir = await outDir('strict-stop');
  const result = await run(dir, '--strict', '--title', 'An extremely long headline that no cover can hold '.repeat(12));
  assert.equal(result.ok, false);
  assert.match(result.message, /Workflow validation failed/);
  assert.ok((await issues(dir)).some((issue) => issue.level === 'error' && issue.code === 'text-overflow'));
  await assert.rejects(readFile(path.join(dir, 'manifest.json')), { code: 'ENOENT' });
});
