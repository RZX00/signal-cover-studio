// Unit tests for the parts of cover-edit that need no browser.
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  CoverEditError,
  PLATFORM_PACKS,
  buildRenderModel,
  getPlatformPack,
  normalizeProjectSpec
} from '../src/lib/index.js';
import { renderStandaloneArticleHtml } from '../src/lib/article-html.js';
import { parseTargetList, parseTemplateMap, writeScaffoldedSpec } from '../src/node/content-source.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exampleSpec = async () => JSON.parse(await readFile(path.join(root, 'examples/specs/fundraising.json'), 'utf8'));

test('image sizes are the ones the README table promises', () => {
  const size = (id) => [PLATFORM_PACKS[id].canvas.width, PLATFORM_PACKS[id].canvas.height];
  assert.deepEqual(size('wechat-cover'), [900, 383]);
  assert.deepEqual(size('xhs-cover'), [1200, 1600]);
  assert.deepEqual(size('x-post'), [1600, 1200]);
  assert.equal(PLATFORM_PACKS['wechat-article'].kind, 'article');
});

test('an unknown platform is a CoverEditError', () => {
  assert.throws(() => getPlatformPack('tiktok-cover'), CoverEditError);
});

test('the example spec normalizes to four targets with default formats', async () => {
  const project = normalizeProjectSpec(await exampleSpec());
  assert.deepEqual(
    project.targets.map((target) => [target.id, target.output.format]),
    [['wechat-cover', 'png'], ['wechat-article', 'html'], ['xhs-cover', 'png'], ['x-post', 'png']]
  );
  assert.equal(project.style.allowSpeechBubble, false);
});

test('a spec without a title or with an unknown platform is rejected', async () => {
  const noTitle = await exampleSpec();
  delete noTitle.source.title;
  assert.throws(() => normalizeProjectSpec(noTitle), CoverEditError);

  const badPlatform = await exampleSpec();
  badPlatform.targets[0].platform = 'tiktok-cover';
  assert.throws(() => normalizeProjectSpec(badPlatform), CoverEditError);
});

test('--targets and --template-map parse as documented', () => {
  assert.deepEqual(parseTargetList(''), ['wechat-cover', 'wechat-article', 'xhs-cover', 'x-post']);
  assert.deepEqual(parseTargetList('all'), parseTargetList(''));
  assert.deepEqual(parseTargetList(' x-post, xhs-cover '), ['x-post', 'xhs-cover']);
  assert.deepEqual(parseTemplateMap('wechat-cover=editorial-minimal, x-post=editorial-cover'), {
    'wechat-cover': 'editorial-minimal',
    'x-post': 'editorial-cover'
  });
});

test('a Markdown article scaffolds title, subtitle, summary and all four targets', async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cover-edit-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const source = path.join(dir, 'post.md');
  await writeFile(source, '# 标题在这里\n\n## 副标题在这里\n\n第一段会成为摘要。\n\n第二段是正文。\n', 'utf8');

  const { project, outputPath } = await writeScaffoldedSpec({ sourcePath: source, outFile: path.join(dir, 'out', 'project.spec.json') });

  assert.equal(project.source.title, '标题在这里');
  assert.equal(project.source.subtitle, '副标题在这里');
  assert.equal(project.source.summary, '第一段会成为摘要。');
  assert.deepEqual(project.targets.map((target) => target.platform), ['wechat-cover', 'wechat-article', 'xhs-cover', 'x-post']);
  // The written file is what later steps load, so it must normalize again unchanged.
  assert.deepEqual(normalizeProjectSpec(JSON.parse(await readFile(outputPath, 'utf8'))), project);
});

test('the WeChat article renders as standalone HTML without scripts or remote resources', async () => {
  const project = normalizeProjectSpec(await exampleSpec());
  const model = buildRenderModel(project, 'wechat-article');
  assert.equal(model.kind, 'article');
  const html = renderStandaloneArticleHtml(model);
  assert.match(html, /Finding Investors Is Also a Job/);
  assert.doesNotMatch(html, /<script/i);
  assert.doesNotMatch(html, /(src|href)="https?:/i);
});
