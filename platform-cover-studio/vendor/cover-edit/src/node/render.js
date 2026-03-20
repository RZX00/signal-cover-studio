import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createStaticServer } from './server.js';
import { getTarget, inlineProjectAssets, prepareBrowserProject, resolveOutputPath } from './project-loader.js';
import { buildRenderModel } from '../lib/render-model.js';
import { renderStandaloneArticleHtml } from '../lib/article-html.js';

async function ensureDir(filePath) {
  await mkdir(path.dirname(filePath), { recursive: true });
}

export async function renderTargetToFile({ rootDir, projectBundle, targetRef, outFile }) {
  const target = getTarget(projectBundle.project, targetRef);
  const outputPath = resolveOutputPath(target, outFile);
  await ensureDir(outputPath);

  if (target.output.format === 'html') {
    const inlineProject = await inlineProjectAssets(projectBundle.project, projectBundle.specDir);
    const model = buildRenderModel(inlineProject, target.id);
    const html = renderStandaloneArticleHtml(model);
    await writeFile(outputPath, html, 'utf8');
    return { outputPath, kind: 'html', targetId: target.id };
  }

  const browserProject = prepareBrowserProject(projectBundle.project, projectBundle.specDir);
  const server = await createStaticServer(rootDir);
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage({ viewport: { width: 2200, height: 2200 }, deviceScaleFactor: 1 });
    await page.addInitScript(({ spec, targetId }) => {
      window.__COVER_EDIT_SPEC__ = spec;
      window.__COVER_EDIT_TARGET__ = targetId;
    }, { spec: browserProject, targetId: target.id });
    await page.goto(`${server.url}/render.html`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.__renderReady === true);
    const renderError = await page.evaluate(() => window.__renderError || null);
    if (renderError) throw new Error(renderError.message || 'Render failed');

    const locator = page.locator('.render-root');
    await locator.screenshot({
      path: outputPath,
      type: target.output.format === 'jpg' ? 'jpeg' : 'png',
      quality: target.output.format === 'jpg' ? 92 : undefined,
      animations: 'disabled'
    });

    return { outputPath, kind: 'image', targetId: target.id };
  } finally {
    await browser.close();
    await server.close();
  }
}

export async function bundleProjectTargets({ rootDir, projectBundle, outDir }) {
  const outputs = [];
  for (const target of projectBundle.project.targets) {
    outputs.push(await renderTargetToFile({ rootDir, projectBundle, targetRef: target.id, outFile: resolveOutputPath(target, '', outDir) }));
  }
  return outputs;
}
