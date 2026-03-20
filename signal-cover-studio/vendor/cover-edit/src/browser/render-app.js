import { buildRenderModel } from '../lib/render-model.js';
import { renderModelToElement, collectRenderMetrics } from './render-dom.js';
import { normalizeProjectForBrowser } from './browser-normalize.js';

const fallbackSpec = {
  version: '1.0',
  projectId: 'render-shell',
  source: {
    title: 'Render model online',
    subtitle: 'Shared preview/export path is ready for Playwright',
    summary: 'The same render model now drives the browser shell.'
  },
  targets: [{ id: 'x-post', platform: 'x-post', template: 'editorial-cover' }]
};

async function resolveSpec() {
  if (window.__COVER_EDIT_SPEC__) return window.__COVER_EDIT_SPEC__;
  const specUrl = new URL(window.location.href).searchParams.get('spec');
  if (specUrl) {
    const response = await fetch(specUrl);
    return await response.json();
  }
  return fallbackSpec;
}

function summarizeBlockingIssues(metrics) {
  const blocking = (metrics?.textMetrics || [])
    .filter((item) => item.issues.some((issue) => issue !== 'hit-min-font-size'))
    .map((item) => `${item.layerId}: ${item.issues.filter((issue) => issue !== 'hit-min-font-size').join(', ')}`);

  return blocking.length ? `Layout validation failed — ${blocking.join(' | ')}` : '';
}

async function mountRenderShell() {
  const root = document.querySelector('#render-app');
  const spec = normalizeProjectForBrowser(await resolveSpec());
  const target = window.__COVER_EDIT_TARGET__ || new URL(window.location.href).searchParams.get('target') || spec.targets[0].id;
  const model = buildRenderModel(spec, target);
  renderModelToElement(model, root);
  window.__coverEditModel = model;
  window.__coverEditMetrics = collectRenderMetrics(model, root.querySelector('.render-root') || root);
  window.__renderError = window.__coverEditMetrics.ok ? null : { message: summarizeBlockingIssues(window.__coverEditMetrics), metrics: window.__coverEditMetrics };
  window.__renderReady = true;
}

window.addEventListener('DOMContentLoaded', () => {
  mountRenderShell().catch((error) => {
    document.querySelector('#render-app').textContent = error.message;
    window.__renderReady = true;
    window.__renderError = { message: error.message, meta: error.meta || null };
  });
});
