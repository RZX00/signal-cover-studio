import { CoverEditError } from './errors.js';

export const TEMPLATE_REGISTRY = {
  'editorial-minimal': {
    id: 'editorial-minimal',
    label: 'Editorial Minimal',
    compatiblePlatforms: ['wechat-cover', 'x-post'],
    defaultTheme: 'soft-gradient-editorial',
    fontProfile: 'gradient-cover-cn-en'
  },
  'editorial-cover': {
    id: 'editorial-cover',
    label: 'Editorial Cover',
    compatiblePlatforms: ['wechat-cover', 'xhs-cover', 'x-post'],
    defaultTheme: 'soft-gradient-editorial',
    fontProfile: 'gradient-cover-cn-en'
  },
  'comic-explainer': {
    id: 'comic-explainer',
    label: 'Comic Explainer',
    compatiblePlatforms: ['xhs-cover', 'x-post'],
    defaultTheme: 'comic-night',
    fontProfile: 'comic-cn-en'
  },
  'wechat-article-clean': {
    id: 'wechat-article-clean',
    label: 'WeChat Article Clean',
    compatiblePlatforms: ['wechat-article'],
    defaultTheme: 'paper-ink',
    fontProfile: 'editorial-cn-en'
  }
};

export function listTemplates() {
  return Object.values(TEMPLATE_REGISTRY);
}

export function getTemplate(templateId) {
  const template = TEMPLATE_REGISTRY[templateId];
  if (!template) throw new CoverEditError(`Unknown template: ${templateId}`, { templateId });
  return template;
}

export function assertTemplateCompatible(templateId, platformId) {
  const template = getTemplate(templateId);
  if (!template.compatiblePlatforms.includes(platformId)) {
    throw new CoverEditError(`Template ${templateId} is not compatible with ${platformId}`, { templateId, platformId });
  }
  return template;
}
