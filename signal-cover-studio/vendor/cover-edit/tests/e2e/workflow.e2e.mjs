// End-to-end: run the skill's entry script on the bundled example with --strict and
// check what the README says comes out. Needs Chromium (npx playwright install chromium).
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

async function pngSize(file) {
  const bytes = await readFile(file);
  assert.equal(bytes.subarray(1, 4).toString('latin1'), 'PNG', `${file} is not a PNG`);
  return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
}

test('the example article becomes three covers and one HTML file', async () => {
  // COVER_E2E_OUT lets CI keep the images as an artifact.
  const outDir = process.env.COVER_E2E_OUT || (await mkdtemp(path.join(os.tmpdir(), 'cover-e2e-')));
  await promisify(execFile)(
    process.execPath,
    [entry, '--source', path.join(root, 'examples/content/fundraising.md'), '--out-dir', outDir, '--strict'],
    { cwd: os.tmpdir() }
  );

  assert.deepEqual(await pngSize(path.join(outDir, 'wechat-cover.png')), [900, 383]);
  assert.deepEqual(await pngSize(path.join(outDir, 'xhs-cover.png')), [1200, 1600]);
  assert.deepEqual(await pngSize(path.join(outDir, 'x-post.png')), [1600, 1200]);
  assert.match(await readFile(path.join(outDir, 'wechat-article.html'), 'utf8'), /<html/i);

  const manifest = JSON.parse(await readFile(path.join(outDir, 'manifest.json'), 'utf8'));
  assert.equal(manifest.outputs.length, 4);
  const errors = manifest.validations.flatMap((item) => item.issues).filter((issue) => issue.level === 'error');
  assert.deepEqual(errors, []);
  for (const name of ['project.spec.json', 'validation.json']) {
    JSON.parse(await readFile(path.join(outDir, name), 'utf8'));
  }
});
