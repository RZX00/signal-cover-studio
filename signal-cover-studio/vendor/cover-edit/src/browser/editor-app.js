import { buildRenderModel } from '../lib/render-model.js';
import { renderModelToElement } from './render-dom.js';
import { normalizeProjectForBrowser } from './browser-normalize.js';

const sampleSpec = {
  version: '1.0',
  projectId: 'fundraising-2026-03-19',
  locale: 'en-US',
  source: {
    title: 'Finding Investors Is Also a Job',
    subtitle: 'Define the right person. Build the profile. Then go search.',
    summary: 'Fundraising works better when it becomes deliberate matching instead of random outreach.',
    keywords: ['Fundraising', 'Investor Fit', 'Matching'],
    body: [
      { type: 'lead', text: 'Write the profile first, then start searching.' },
      { type: 'paragraph', text: 'Treat investor outreach like a structured matching problem instead of open-ended networking.' }
    ]
  },
  assets: {
    images: [{ id: 'hero-orb', path: './examples/assets/hero-orb.svg', role: 'hero', alt: 'abstract orb' }]
  },
  style: {
    theme: 'soft-gradient-editorial',
    fontProfile: 'gradient-cover-cn-en',
    allowIllustration: false,
    allowSpeechBubble: false
  },
  targets: [
    { id: 'wechat-cover', platform: 'wechat-cover', template: 'editorial-minimal' },
    { id: 'wechat-article', platform: 'wechat-article', template: 'wechat-article-clean', output: { format: 'html' } },
    { id: 'xhs-cover', platform: 'xhs-cover', template: 'editorial-cover' },
    { id: 'x-post', platform: 'x-post', template: 'editorial-cover' }
  ]
};

const state = {
  rawSpec: JSON.stringify(sampleSpec, null, 2),
  targetId: 'xhs-cover'
};

function renderEditor() {
  const app = document.querySelector('#app');
  app.innerHTML = `
    <main class="app-shell">
      <section class="panel">
        <div>
          <div class="kicker">cover-edit / phase 2</div>
          <h1 class="hero-title">Schema, packs, templates, render model.</h1>
        </div>
        <p class="hero-copy">The studio now previews a normalized spec through the shared render model. Same spec, different targets.</p>
        <div class="toolbar-grid">
          <label>
            <span class="label">Target</span>
            <select id="target-select">
              <option value="wechat-cover">wechat-cover</option>
              <option value="xhs-cover">xhs-cover</option>
              <option value="x-post">x-post</option>
              <option value="wechat-article">wechat-article</option>
            </select>
          </label>
          <label>
            <span class="label">Spec JSON</span>
            <textarea id="spec-json" rows="18"></textarea>
          </label>
        </div>
        <div class="actions">
          <button id="apply-spec">Apply spec</button>
          <button class="secondary" id="reset-spec">Reset sample</button>
        </div>
        <div id="status" class="status-box">Ready.</div>
        <div id="model-json" class="code-box"></div>
      </section>
      <section class="preview-panel">
        <div class="canvas-shell">
          <div class="canvas-stage">
            <div id="preview-root"></div>
          </div>
        </div>
      </section>
    </main>
  `;

  document.querySelector('#target-select').value = state.targetId;
  document.querySelector('#spec-json').value = state.rawSpec;
  document.querySelector('#apply-spec').addEventListener('click', applySpec);
  document.querySelector('#reset-spec').addEventListener('click', () => {
    state.rawSpec = JSON.stringify(sampleSpec, null, 2);
    document.querySelector('#spec-json').value = state.rawSpec;
    state.targetId = 'xhs-cover';
    document.querySelector('#target-select').value = state.targetId;
    applySpec();
  });
  document.querySelector('#target-select').addEventListener('change', (event) => {
    state.targetId = event.target.value;
    applySpec();
  });

  applySpec();
}

function applySpec() {
  const status = document.querySelector('#status');
  try {
    state.rawSpec = document.querySelector('#spec-json').value;
    const normalized = normalizeProjectForBrowser(JSON.parse(state.rawSpec));
    const model = buildRenderModel(normalized, state.targetId);
    const previewRoot = document.querySelector('#preview-root');
    renderModelToElement(model, previewRoot);
    document.querySelector('#model-json').textContent = JSON.stringify(model, null, 2);
    status.textContent = `Rendered ${model.target.platform} with template ${model.template.id}.`;
  } catch (error) {
    status.textContent = `${error.name || 'Error'}: ${error.message}`;
    document.querySelector('#model-json').textContent = error.meta ? JSON.stringify(error.meta, null, 2) : '';
  }
}

renderEditor();
