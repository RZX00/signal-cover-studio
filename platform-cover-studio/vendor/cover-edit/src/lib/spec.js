import Ajv2020 from 'ajv/dist/2020.js';
import { projectSchema } from './project-schema.js';
import { getPlatformPack } from './platforms.js';
import { getTemplate } from './templates.js';
import { deepClone, ensureArray, slugify } from './utils.js';
import { CoverEditError } from './errors.js';

const ajv = new Ajv2020({ allErrors: true, useDefaults: true, strict: false });
const validateProject = ajv.compile(projectSchema);

function defaultBodyBlocks(source) {
  if (ensureArray(source.body).length) return source.body;
  const blocks = [];
  if (source.summary) blocks.push({ type: 'lead', text: source.summary });
  return blocks;
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
    output: {
      format: target.output?.format || pack.exports[0],
      path: target.output?.path || ''
    },
    slug: slugify(target.id || `${target.platform}-${template}-${index + 1}`)
  };
}

export function normalizeProjectSpec(input) {
  const working = deepClone(input);
  if (!validateProject(working)) {
    throw new CoverEditError('Project spec validation failed', { errors: validateProject.errors || [] });
  }

  const normalized = {
    version: '1.0',
    projectId: working.projectId,
    locale: working.locale || working.source.language || 'zh-CN',
    source: {
      title: working.source.title,
      subtitle: working.source.subtitle || '',
      summary: working.source.summary || '',
      body: defaultBodyBlocks(working.source),
      keywords: ensureArray(working.source.keywords),
      language: working.source.language || working.locale || 'zh-CN'
    },
    assets: {
      images: ensureArray(working.assets?.images)
    },
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

  return normalized;
}

export { getTargetSpec } from './project-utils.js';
