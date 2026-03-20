import { buildRenderModel } from '../lib/render-model.js';
import { renderArticleBodyHtml } from '../lib/article-html.js';

const OVERFLOW_EPSILON = 2;
const LINE_GROUP_EPSILON = 2;

function applyFrame(node, frame) {
  node.style.left = `${frame.x}px`;
  node.style.top = `${frame.y}px`;
  node.style.width = `${frame.width}px`;
  node.style.height = `${frame.height}px`;
}

function renderBackground(root, layer) {
  if (layer.fill?.kind === 'solid') {
    root.style.background = layer.fill.color;
    return;
  }

  if (layer.fill?.kind === 'css') {
    root.style.backgroundColor = layer.fill.color || 'transparent';
    root.style.background = layer.fill.value;
  }
}

function renderShape(layer) {
  const node = document.createElement('div');
  node.className = `ce-layer ce-shape ce-shape-${layer.shape}`;
  applyFrame(node, layer.frame);
  node.style.opacity = `${layer.opacity ?? 1}`;

  if (layer.fill?.kind === 'radial') {
    node.style.background = `radial-gradient(circle at 35% 35%, ${layer.fill.color}, rgba(255,255,255,0) 70%)`;
  } else if (layer.fill?.kind === 'glass') {
    node.style.background = layer.fill.color;
    node.style.backdropFilter = 'blur(24px)';
  } else {
    node.style.background = layer.fill?.color || 'transparent';
  }

  if (layer.stroke) {
    node.style.border = `${layer.stroke.width || 1}px solid ${layer.stroke.color}`;
  }

  if (layer.shape === 'panel') node.style.borderRadius = '28px';
  if (layer.shape === 'capsule') node.style.borderRadius = '999px';
  if (layer.shape === 'orb' || layer.shape === 'ring') node.style.borderRadius = '50%';
  if (layer.shape === 'ring') {
    node.style.background = 'transparent';
    node.style.boxShadow = `0 0 0 ${layer.stroke?.width || 4}px ${layer.stroke?.color || '#fff'} inset`;
    node.style.border = '0';
  }
  if (layer.shape === 'speech') node.style.borderRadius = '36px';
  if (layer.shape === 'burst') {
    node.style.clipPath = 'polygon(50% 0%, 62% 20%, 85% 8%, 78% 32%, 100% 50%, 78% 68%, 85% 92%, 62% 80%, 50% 100%, 38% 80%, 15% 92%, 22% 68%, 0% 50%, 22% 32%, 15% 8%, 38% 20%)';
  }

  return node;
}

function renderImage(layer) {
  const node = document.createElement('div');
  node.className = 'ce-layer ce-image';
  node.dataset.layerId = layer.id || '';
  applyFrame(node, layer.frame);
  node.style.backgroundImage = `url("${layer.src}")`;
  node.style.backgroundSize = layer.fit === 'contain' ? 'contain' : 'cover';
  node.style.backgroundRepeat = 'no-repeat';
  node.style.backgroundPosition = 'center';
  node.style.borderRadius = `${layer.borderRadius || 24}px`;
  return node;
}

function computedLineHeight(node, fallbackFontSize) {
  const value = Number.parseFloat(getComputedStyle(node).lineHeight);
  if (Number.isFinite(value)) return value;
  return Math.ceil(fallbackFontSize * 1.2);
}

function collectLineRects(node) {
  if (!node.textContent) return [];

  const range = document.createRange();
  range.selectNodeContents(node);
  const rawRects = [...range.getClientRects()]
    .filter((rect) => rect.width > 0 && rect.height > 0)
    .map((rect) => ({
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height
    }))
    .sort((a, b) => (Math.abs(a.top - b.top) > LINE_GROUP_EPSILON ? a.top - b.top : a.left - b.left));

  const lines = [];
  for (const rect of rawRects) {
    const current = lines.at(-1);
    if (!current || Math.abs(current.top - rect.top) > LINE_GROUP_EPSILON) {
      lines.push({ ...rect });
      continue;
    }
    current.left = Math.min(current.left, rect.left);
    current.right = Math.max(current.right, rect.right);
    current.top = Math.min(current.top, rect.top);
    current.bottom = Math.max(current.bottom, rect.bottom);
    current.width = current.right - current.left;
    current.height = current.bottom - current.top;
  }

  return lines;
}

function measureText(node, maxLines, fallbackFontSize) {
  const lineHeight = computedLineHeight(node, fallbackFontSize);
  const lineRects = collectLineRects(node);
  const lineCount = lineRects.length || Math.max(1, Math.round(node.scrollHeight / Math.max(lineHeight, 1)));
  const widestLineWidth = lineRects.length
    ? Math.max(...lineRects.map((rect) => rect.width))
    : Math.min(node.scrollWidth, node.clientWidth || node.scrollWidth || 0);
  const lastLineWidth = lineRects.length ? lineRects.at(-1).width : widestLineWidth;
  const contentHeight = lineRects.length
    ? Math.ceil(lineRects.at(-1).bottom - lineRects[0].top)
    : Math.ceil(lineHeight * lineCount);
  const lastLineRatio = widestLineWidth > 0 ? lastLineWidth / widestLineWidth : 1;
  const horizontalSlack = maxLines === 1 ? OVERFLOW_EPSILON * 3 : OVERFLOW_EPSILON;
  const overflowX = widestLineWidth > node.clientWidth + horizontalSlack;
  const overflowY = lineCount > maxLines || contentHeight > node.clientHeight + OVERFLOW_EPSILON;

  return {
    lineHeight,
    lineCount,
    widestLineWidth,
    lastLineWidth,
    lastLineRatio,
    contentHeight,
    overflowX,
    overflowY
  };
}

function applyCandidateStyles(node, layer, candidate, fontSize, allowedHeight) {
  node.style.fontSize = `${fontSize}px`;
  node.style.lineHeight = `${layer.style.lineHeight || '1'}`;
  node.style.letterSpacing = `${layer.style.letterSpacing || '0'}`;
  node.style.whiteSpace = candidate.wrapMode === 'nowrap' ? 'nowrap' : 'pre-wrap';
  node.style.textWrap = candidate.wrapMode === 'pretty'
    ? 'pretty'
    : candidate.wrapMode === 'nowrap'
      ? 'nowrap'
      : 'wrap';
  node.style.overflowWrap = candidate.wrapMode === 'nowrap' ? 'normal' : 'break-word';
  node.style.wordBreak = 'normal';
  node.style.hyphens = candidate.wrapMode === 'nowrap' ? 'manual' : 'auto';
  node.style.height = `${allowedHeight}px`;
  node.style.maxHeight = `${allowedHeight}px`;
  node.style.minHeight = `${allowedHeight}px`;
}

function buildTextCandidates(layer) {
  const fit = layer.fit || {};
  const maxLines = Math.max(1, fit.maxLines || 3);

  if (maxLines === 1) return [{ wrapMode: 'nowrap', maxLines: 1 }];

  return [
    { wrapMode: 'nowrap', maxLines: 1 },
    { wrapMode: 'pretty', maxLines },
    { wrapMode: 'wrap', maxLines }
  ];
}

function candidateCost(result, fit, candidate) {
  const span = Math.max(1, (fit.maxFontSize || 48) - (fit.minFontSize || 14));
  const fontLoss = ((fit.maxFontSize || 48) - result.fontSize) / span;
  let cost = fontLoss * 90;

  if (result.overflowX || result.overflowY) cost += 10000;
  if (result.lineCount > 1) cost += (result.lineCount - 1) * 32;
  if (result.lineCount > 1) cost += Math.max(0, 0.52 - result.lastLineRatio) * 140;
  if (result.fontSize <= (fit.minFontSize || 14) + 0.5) cost += 18;

  if (candidate.wrapMode === 'nowrap') {
    if (result.fontSize >= (fit.maxFontSize || 48) * 0.8) cost -= 14;
    if (result.fontSize < (fit.maxFontSize || 48) * 0.62) cost += 46;
  }

  if (candidate.wrapMode === 'pretty') cost -= 4;

  return cost;
}

function resolveTextHeight(layer, metrics, allowedHeight) {
  if (layer.background || layer.fit?.verticalAlign === 'center') return allowedHeight;
  return Math.max(1, Math.min(allowedHeight, Math.ceil(metrics.contentHeight + 2)));
}

function fitText(node, layer, options = {}) {
  const fit = layer.fit || {};
  const allowedHeight = Math.max(1, Math.round(options.maxHeight || layer.frame.height || node.clientHeight || 1));
  const candidates = buildTextCandidates(layer);
  let best = null;

  for (const candidate of candidates) {
    let fontSize = fit.maxFontSize || 48;
    const minFontSize = fit.minFontSize || 14;
    const step = fontSize - minFontSize > 48 ? 2 : 1;

    while (fontSize >= minFontSize) {
      applyCandidateStyles(node, layer, candidate, fontSize, allowedHeight);
      const metrics = measureText(node, candidate.maxLines, fontSize);
      const result = {
        ...metrics,
        candidate,
        fontSize,
        cost: 0
      };
      result.cost = candidateCost(result, fit, candidate);

      if (!best || result.cost < best.cost) best = result;
      if (!metrics.overflowX && !metrics.overflowY) break;
      fontSize -= step;
    }
  }

  applyCandidateStyles(node, layer, best.candidate, best.fontSize, allowedHeight);
  let metrics = measureText(node, best.candidate.maxLines, best.fontSize);
  const resolvedHeight = resolveTextHeight(layer, metrics, allowedHeight);
  node.style.height = `${resolvedHeight}px`;
  node.style.maxHeight = `${resolvedHeight}px`;
  node.style.minHeight = `${resolvedHeight}px`;
  metrics = measureText(node, best.candidate.maxLines, best.fontSize);

  node.dataset.finalFontSize = `${best.fontSize}`;
  node.dataset.overflowX = `${metrics.overflowX}`;
  node.dataset.overflowY = `${metrics.overflowY}`;
  node.dataset.maxLines = `${best.candidate.maxLines}`;
  node.dataset.minFontSize = `${fit.minFontSize || 14}`;
  node.dataset.lineCount = `${metrics.lineCount}`;
  node.dataset.lastLineRatio = `${metrics.lastLineRatio}`;
  node.dataset.wrapMode = best.candidate.wrapMode;
  node.dataset.actualHeight = `${Math.ceil(metrics.contentHeight)}`;
  node.dataset.resolvedHeight = `${resolvedHeight}`;

  return {
    ...metrics,
    fontSize: best.fontSize,
    wrapMode: best.candidate.wrapMode,
    actualHeight: Math.ceil(metrics.contentHeight),
    resolvedHeight
  };
}

function renderText(layer) {
  const node = document.createElement('div');
  node.className = 'ce-layer ce-text';
  node.dataset.layerId = layer.id || '';
  node.dataset.layerType = 'text';
  applyFrame(node, layer.frame);
  node.textContent = layer.text || '';
  node.style.color = layer.style.color;
  node.style.fontFamily = layer.style.family;
  node.style.fontWeight = `${layer.style.weight}`;
  node.style.fontStyle = layer.style.fontStyle || 'normal';
  node.style.lineHeight = `${layer.style.lineHeight}`;
  node.style.letterSpacing = `${layer.style.letterSpacing}`;
  node.style.textAlign = layer.fit?.align || 'left';
  node.style.justifyContent = layer.fit?.verticalAlign === 'center' ? 'center' : 'flex-start';
  node.style.alignItems = layer.fit?.align === 'center' ? 'center' : layer.fit?.align === 'right' ? 'flex-end' : 'flex-start';
  if (layer.background) {
    node.style.background = layer.background.color;
    node.style.borderRadius = `${layer.background.radius || 20}px`;
    node.style.padding = '0.22em 0.6em';
    node.style.width = 'auto';
    node.style.minWidth = `${Math.min(layer.frame.width, 160)}px`;
    node.style.maxWidth = `${layer.frame.width}px`;
  }
  return node;
}

function textNodeForLayer(root, layerId) {
  return root.querySelector(`.ce-text[data-layer-id="${layerId}"]`);
}

function fitIndependentTextLayers(model, root) {
  for (const layer of model.layers || []) {
    if (layer.type !== 'text' || layer.stack?.group) continue;
    const node = textNodeForLayer(root, layer.id);
    if (!node) continue;
    fitText(node, layer);
  }
}

function reflowTextStacks(model, root) {
  const groups = new Map();
  for (const layer of model.layers || []) {
    if (layer.type !== 'text' || !layer.stack?.group) continue;
    const list = groups.get(layer.stack.group) || [];
    list.push(layer);
    groups.set(layer.stack.group, list);
  }

  for (const layers of groups.values()) {
    layers.sort((a, b) => (a.stack.order || 0) - (b.stack.order || 0));
    let previousBottom = null;

    for (const layer of layers) {
      const node = textNodeForLayer(root, layer.id);
      if (!node) continue;

      const top = previousBottom == null
        ? layer.frame.y
        : Math.round(previousBottom + (layer.stack?.gapBefore || 0));
      node.style.top = `${top}px`;

      const safeBottom = layer.stack?.safeBottom || model.canvas.height;
      const reserveBelow = layer.stack?.reserveBelow || 0;
      const allowedHeight = Math.max(1, safeBottom - top - reserveBelow);
      const metrics = fitText(node, layer, { maxHeight: allowedHeight });
      previousBottom = top + metrics.resolvedHeight;
    }
  }
}

function boxesOverlap(a, b) {
  return a.left < b.right - OVERFLOW_EPSILON
    && a.right > b.left + OVERFLOW_EPSILON
    && a.top < b.bottom - OVERFLOW_EPSILON
    && a.bottom > b.top + OVERFLOW_EPSILON;
}

function collectImageMetrics(model, root) {
  const safe = model.safeArea;
  const textNodes = [...root.querySelectorAll('.ce-text')];
  const safeBox = {
    left: safe.left,
    top: safe.top,
    right: model.canvas.width - safe.right,
    bottom: model.canvas.height - safe.bottom
  };

  const textMetrics = textNodes.map((node) => {
    const rect = node.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();
    const localRect = {
      left: rect.left - rootRect.left,
      top: rect.top - rootRect.top,
      right: rect.right - rootRect.left,
      bottom: rect.bottom - rootRect.top
    };
    const issues = [];
    if (localRect.left < safeBox.left || localRect.top < safeBox.top || localRect.right > safeBox.right || localRect.bottom > safeBox.bottom) {
      issues.push('outside-safe-area');
    }
    if ((node.dataset.overflowX === 'true' || node.dataset.overflowY === 'true') && node.dataset.layerId !== 'eyebrow') issues.push('text-overflow');
    if (Number(node.dataset.finalFontSize) <= Number(node.dataset.minFontSize)) issues.push('hit-min-font-size');
    return {
      layerId: node.dataset.layerId,
      finalFontSize: Number(node.dataset.finalFontSize),
      lineCount: Number(node.dataset.lineCount || 0),
      lastLineRatio: Number(node.dataset.lastLineRatio || 1),
      wrapMode: node.dataset.wrapMode || 'wrap',
      actualHeight: Number(node.dataset.actualHeight || 0),
      issues,
      frame: localRect
    };
  });

  for (let index = 0; index < textMetrics.length; index += 1) {
    for (let cursor = index + 1; cursor < textMetrics.length; cursor += 1) {
      if (boxesOverlap(textMetrics[index].frame, textMetrics[cursor].frame)) {
        textMetrics[index].issues.push(`text-overlap:${textMetrics[cursor].layerId}`);
        textMetrics[cursor].issues.push(`text-overlap:${textMetrics[index].layerId}`);
      }
    }
  }

  return {
    ok: textMetrics.every((item) => item.issues.filter((issue) => issue !== 'hit-min-font-size').length === 0),
    canvas: model.canvas,
    safeArea: safe,
    textMetrics
  };
}

function collectArticleMetrics(model) {
  const titleLength = model.article.title.length;
  const blockCount = model.article.blocks.length;
  const issues = [];
  if (titleLength > 60) issues.push({ level: 'warning', code: 'title-too-long', message: `Article title is ${titleLength} chars.` });
  if (blockCount === 0) issues.push({ level: 'warning', code: 'empty-body', message: 'Article has no body blocks.' });
  return { ok: true, titleLength, blockCount, issues };
}

export function renderModelToElement(model, root) {
  root.innerHTML = '';
  root.className = 'render-root ce-render-root';
  root.dataset.kind = model.kind;

  if (model.kind === 'article') {
    root.style.width = `${model.pack.page.width}px`;
    root.style.minHeight = '1200px';
    root.innerHTML = renderArticleBodyHtml(model);
    return root;
  }

  root.style.width = `${model.canvas.width}px`;
  root.style.height = `${model.canvas.height}px`;
  root.style.position = 'relative';
  root.style.overflow = 'hidden';

  for (const layer of model.layers) {
    if (layer.type === 'background') {
      renderBackground(root, layer);
      continue;
    }
    if (layer.type === 'shape') {
      root.appendChild(renderShape(layer));
      continue;
    }
    if (layer.type === 'image') {
      root.appendChild(renderImage(layer));
      continue;
    }
    if (layer.type === 'text') root.appendChild(renderText(layer));
  }

  fitIndependentTextLayers(model, root);
  reflowTextStacks(model, root);
  return root;
}

export function collectRenderMetrics(model, root) {
  return model.kind === 'article' ? collectArticleMetrics(model) : collectImageMetrics(model, root);
}

export function buildAndRender(projectSpec, targetId, root) {
  const model = buildRenderModel(projectSpec, targetId);
  renderModelToElement(model, root);
  return model;
}
