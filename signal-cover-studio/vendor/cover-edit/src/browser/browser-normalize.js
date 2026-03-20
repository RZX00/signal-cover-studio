import { getPlatformPack } from '../lib/platforms.js';
import { getTemplate } from '../lib/templates.js';
import { deepClone, ensureArray, slugify } from '../lib/utils.js';

function defaultBodyBlocks(source) {
  if (ensureArray(source.body).length) return source.body;
  return source.summary ? [{ type: 'lead', text: source.summary }] : [];
}

function normalizeTarget(target, index) {
  const pack = getPlatformPack(target.platform);
  const template = target.template || pack.defaultTemplate;
  getTemplate(template);
  return {
    id: target.id || `${target.platform}-${index + 1}`,
    platform: target.platform,
    template,
    variant: target.variant || 'default',
    overrides: target.overrides || {},
    output: { format: target.output?.format || pack.exports[0], path: target.output?.path || '' },
    slug: slugify(target.id || `${target.platform}-${template}-${index + 1}`)
  };
}

export function normalizeProjectForBrowser(input) {
  const working = deepClone(input || {});
  const source = working.source || {};
  return {
    version: '1.0',
    projectId: working.projectId || 'browser-project',
    locale: working.locale || source.language || 'zh-CN',
    source: {
      title: source.title || 'Untitled project',
      subtitle: source.subtitle || '',
      summary: source.summary || '',
      body: defaultBodyBlocks(source),
      keywords: ensureArray(source.keywords),
      language: source.language || working.locale || 'zh-CN'
    },
    assets: { images: ensureArray(working.assets?.images) },
    style: {
      theme: working.style?.theme || '',
      mood: working.style?.mood || 'editorial',
      density: working.style?.density || 'medium',
      contrast: working.style?.contrast || 'high',
      fontProfile: working.style?.fontProfile || '',
      allowIllustration: working.style?.allowIllustration ?? true,
      allowSpeechBubble: working.style?.allowSpeechBubble ?? false
    },
    targets: ensureArray(working.targets).map(normalizeTarget)
  };
}
