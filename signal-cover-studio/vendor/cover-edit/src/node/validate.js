import { chromium } from 'playwright';
import { buildRenderModel } from '../lib/render-model.js';
import { createStaticServer } from './server.js';
import { getTarget, prepareBrowserProject } from './project-loader.js';

export async function validateTarget({ rootDir, projectBundle, targetRef }) {
  const target = getTarget(projectBundle.project, targetRef);
  const model = buildRenderModel(projectBundle.project, target.id);

  if (model.kind === 'article') {
    const issues = [];
    if (model.article.title.length > 60) issues.push({ level: 'warning', code: 'title-too-long', message: `Title length ${model.article.title.length}` });
    if (!model.article.blocks.length) issues.push({ level: 'warning', code: 'empty-body', message: 'Article has no blocks' });
    return { ok: true, targetId: target.id, kind: 'article', issues, metrics: { blockCount: model.article.blocks.length } };
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
    const metrics = await page.evaluate(() => window.__coverEditMetrics || null);
    const issues = [];
    for (const item of metrics?.textMetrics || []) {
      for (const code of item.issues || []) {
        const level = code === 'hit-min-font-size' ? 'warning' : 'error';
        issues.push({ level, code, layerId: item.layerId, finalFontSize: item.finalFontSize });
      }
    }
    return { ok: issues.every((issue) => issue.level !== 'error'), targetId: target.id, kind: 'image', issues, metrics };
  } finally {
    await browser.close();
    await server.close();
  }
}
