import { CoverEditError } from './errors.js';

export const PLATFORM_PACKS = {
  'wechat-cover': {
    id: 'wechat-cover',
    label: '微信公众号封面',
    kind: 'image',
    canvas: { width: 900, height: 383, safeArea: { top: 28, right: 42, bottom: 28, left: 42 } },
    exports: ['png', 'jpg'],
    contentPolicy: { titleMaxLines: 2, subtitleMaxLines: 2, summaryMaxChars: 64 },
    defaultTemplate: 'editorial-minimal'
  },
  'wechat-article': {
    id: 'wechat-article',
    label: '微信公众号正文',
    kind: 'article',
    page: { width: 840, bodyWidth: 640, padding: 56 },
    exports: ['html'],
    contentPolicy: { summaryMaxChars: 140 },
    defaultTemplate: 'wechat-article-clean'
  },
  'xhs-cover': {
    id: 'xhs-cover',
    label: '小红书封面',
    kind: 'image',
    canvas: { width: 1200, height: 1600, safeArea: { top: 84, right: 76, bottom: 92, left: 76 } },
    exports: ['png', 'jpg'],
    contentPolicy: { titleMaxLines: 4, subtitleMaxLines: 3, summaryMaxChars: 90 },
    defaultTemplate: 'editorial-cover'
  },
  'x-post': {
    id: 'x-post',
    label: 'X 配图',
    kind: 'image',
    canvas: { width: 1600, height: 1200, safeArea: { top: 80, right: 92, bottom: 88, left: 92 } },
    exports: ['png', 'jpg'],
    contentPolicy: { titleMaxLines: 3, subtitleMaxLines: 2, summaryMaxChars: 96 },
    defaultTemplate: 'editorial-cover'
  }
};

export function listPlatformPacks() {
  return Object.values(PLATFORM_PACKS);
}

export function getPlatformPack(platformId) {
  const pack = PLATFORM_PACKS[platformId];
  if (!pack) throw new CoverEditError(`Unknown platform pack: ${platformId}`, { platformId });
  return pack;
}
