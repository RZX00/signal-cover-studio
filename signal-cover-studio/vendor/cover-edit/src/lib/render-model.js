import { getPlatformPack } from './platforms.js';
import { assertTemplateCompatible, getTemplate } from './templates.js';
import { getTheme } from './themes.js';
import { getTypographyProfile } from './typography.js';
import { getTargetSpec } from './project-utils.js';
import { percentFrame, lineClamp } from './utils.js';

function heroImage(project) {
  return project.assets.images.find((item) => item.role === 'hero') || project.assets.images[0] || null;
}

function baseCopy(project, target) {
  return {
    title: target.overrides.title || project.source.title,
    subtitle: target.overrides.subtitle || project.source.subtitle || project.source.summary,
    summary: target.overrides.summary || project.source.summary,
    keywords: project.source.keywords,
    language: project.source.language
  };
}

function backgroundLayers(theme) {
  return [{
    type: 'background',
    fill: theme.backgroundImage
      ? { kind: 'css', color: theme.background, value: theme.backgroundImage }
      : { kind: 'solid', color: theme.background }
  }];
}

function buildTextStyle(typography, role, color) {
  return {
    ...(typography[role] || typography.body),
    color
  };
}

function safeAreaFrame(pack, box) {
  const { width, height, safeArea = { top: 0, right: 0, bottom: 0, left: 0 } } = pack.canvas;
  const inner = {
    x: safeArea.left,
    y: safeArea.top,
    width: width - safeArea.left - safeArea.right,
    height: height - safeArea.top - safeArea.bottom
  };

  return {
    x: Math.round(inner.x + inner.width * box.x),
    y: Math.round(inner.y + inner.height * box.y),
    width: Math.round(inner.width * box.width),
    height: Math.round(inner.height * box.height)
  };
}

function minTextHeight(font, lineHeight, maxLines) {
  return Math.ceil(font.min * lineHeight * maxLines);
}

function buildEditorialStackMeta({ pack, typography, titleFrame, subtitleFrame, summaryFrame, subtitleFont, summaryFont, summaryMaxLines, hasSummary }) {
  const safeBottom = pack.canvas.height - pack.canvas.safeArea.bottom;
  const titleGap = Math.max(0, subtitleFrame.y - (titleFrame.y + titleFrame.height));
  const summaryGap = Math.max(0, summaryFrame.y - (subtitleFrame.y + subtitleFrame.height));
  const minSubtitleHeight = minTextHeight(subtitleFont, typography.subtitle.lineHeight, pack.contentPolicy.subtitleMaxLines);
  const minSummaryHeight = hasSummary
    ? minTextHeight(summaryFont, typography.body.lineHeight, summaryMaxLines)
    : 0;

  return {
    title: {
      group: 'editorial-main',
      order: 1,
      gapBefore: 0,
      reserveBelow: titleGap + minSubtitleHeight + (hasSummary ? summaryGap + minSummaryHeight : 0),
      safeBottom
    },
    subtitle: {
      group: 'editorial-main',
      order: 2,
      gapBefore: titleGap,
      reserveBelow: hasSummary ? summaryGap + minSummaryHeight : 0,
      safeBottom
    },
    summary: {
      group: 'editorial-main',
      order: 3,
      gapBefore: summaryGap,
      reserveBelow: 0,
      safeBottom
    }
  };
}

const EDITORIAL_STACK_BASELINE = {
  eyebrowX: 0.05,
  eyebrowTop: 0.08,
  eyebrowWidth: 0.24,
  eyebrowHeight: 0.05,
  eyebrowAlign: 'left',
  titleX: 0.05,
  titleTop: 0.17,
  titleWidth: 0.62,
  titleHeight: 0.32,
  titleAlign: 'left',
  subtitleMode: 'independent',
  subtitleX: 0.05,
  subtitleTop: 0.58,
  subtitleWidth: 0.34,
  subtitleHeight: 0.12,
  subtitleAlign: 'left',
  summaryMode: 'independent',
  summaryX: 0.58,
  summaryTop: 0.81,
  summaryWidth: 0.28,
  summaryHeight: 0.09,
  summaryAlign: 'right',
  accent: {
    topLines: [],
    bottomDots: []
  },
  fonts: {
    eyebrow: { min: 12, max: 16 },
    title: { min: 68, max: 142 },
    subtitle: { min: 30, max: 48 },
    summary: { min: 18, max: 24 }
  }
};

const EDITORIAL_STACK_TUNING = {
  'wechat-cover': {
    eyebrowX: 0.05,
    eyebrowTop: 0.1,
    eyebrowWidth: 0.22,
    eyebrowHeight: 0.06,
    titleX: 0.05,
    titleTop: 0.2,
    titleWidth: 0.79,
    titleHeight: 0.27,
    subtitleX: 0.05,
    subtitleTop: 0.53,
    subtitleWidth: 0.46,
    subtitleHeight: 0.14,
    summaryX: 0.69,
    summaryTop: 0.77,
    summaryWidth: 0.26,
    summaryHeight: 0.1,
    accent: {
      topLines: [],
      bottomDots: []
    },
    fonts: {
      eyebrow: { min: 12, max: 16 },
      title: { min: 48, max: 92 },
      subtitle: { min: 18, max: 30 },
      summary: { min: 12, max: 15 }
    }
  },
  'xhs-cover': {
    eyebrowX: 0.05,
    eyebrowTop: 0.09,
    eyebrowWidth: 0.3,
    eyebrowHeight: 0.06,
    titleX: 0.05,
    titleTop: 0.17,
    titleWidth: 0.66,
    titleHeight: 0.34,
    subtitleX: 0.05,
    subtitleTop: 0.54,
    subtitleWidth: 0.4,
    subtitleHeight: 0.13,
    summaryX: 0.7,
    summaryTop: 0.79,
    summaryWidth: 0.25,
    summaryHeight: 0.1,
    accent: {
      topLines: [],
      bottomDots: []
    },
    fonts: {
      eyebrow: { min: 22, max: 30 },
      title: { min: 70, max: 138 },
      subtitle: { min: 30, max: 48 },
      summary: { min: 17, max: 19 }
    }
  },
  'x-post': {
    eyebrowX: 0.05,
    eyebrowTop: 0.09,
    eyebrowWidth: 0.28,
    titleX: 0.05,
    titleTop: 0.16,
    titleWidth: 0.66,
    titleHeight: 0.3,
    subtitleX: 0.05,
    subtitleTop: 0.53,
    subtitleWidth: 0.37,
    subtitleHeight: 0.13,
    summaryX: 0.72,
    summaryTop: 0.79,
    summaryWidth: 0.23,
    summaryHeight: 0.08,
    accent: {
      topLines: [],
      bottomDots: []
    },
    fonts: {
      eyebrow: { min: 24, max: 34 },
      title: { min: 72, max: 146 },
      subtitle: { min: 30, max: 48 },
      summary: { min: 18, max: 24 }
    }
  }
};

function editorialLayoutForPack(pack) {
  const tuning = EDITORIAL_STACK_TUNING[pack.id] || {};
  const profile = {
    ...EDITORIAL_STACK_BASELINE,
    ...tuning,
    fonts: {
      ...EDITORIAL_STACK_BASELINE.fonts,
      ...(tuning.fonts || {})
    },
    accent: {
      ...EDITORIAL_STACK_BASELINE.accent,
      ...(tuning.accent || {})
    }
  };

  return {
    eyebrow: { x: profile.eyebrowX, y: profile.eyebrowTop, width: profile.eyebrowWidth, height: profile.eyebrowHeight },
    title: { x: profile.titleX, y: profile.titleTop, width: profile.titleWidth, height: profile.titleHeight },
    subtitle: { x: profile.subtitleX, y: profile.subtitleTop, width: profile.subtitleWidth, height: profile.subtitleHeight },
    summary: { x: profile.summaryX, y: profile.summaryTop, width: profile.summaryWidth, height: profile.summaryHeight },
    topAccents: profile.accent.topLines,
    bottomDots: profile.accent.bottomDots,
    eyebrowAlign: profile.eyebrowAlign || 'left',
    titleAlign: profile.titleAlign || 'left',
    subtitleAlign: profile.subtitleAlign || 'left',
    summaryAlign: profile.summaryAlign || 'left',
    subtitleMode: profile.subtitleMode || 'independent',
    summaryMode: profile.summaryMode || 'independent',
    eyebrowFont: profile.fonts.eyebrow,
    titleFont: profile.fonts.title,
    subtitleFont: profile.fonts.subtitle,
    summaryFont: profile.fonts.summary
  };
}

function buildCleanEditorialLayers({ pack, theme, typography, copy }) {
  const layout = editorialLayoutForPack(pack);
  const eyebrow = (copy.keywords.slice(0, 2).join(' · ') || pack.label).toUpperCase();
  const subtitle = lineClamp(copy.subtitle || copy.summary, pack.contentPolicy.summaryMaxChars);
  const summary = copy.summary && copy.summary !== subtitle ? lineClamp(copy.summary, pack.contentPolicy.summaryMaxChars) : '';
  const summaryMaxLines = pack.id === 'wechat-cover' ? 2 : 3;

  const layers = [
    ...backgroundLayers(theme),
    ...layout.topAccents.map((box, index) => ({
      type: 'shape',
      id: `top-accent-${index + 1}`,
      shape: 'capsule',
      frame: safeAreaFrame(pack, box),
      fill: { kind: 'solid', color: theme.accent },
      opacity: 0.92
    })),
    {
      type: 'text',
      id: 'eyebrow',
      text: eyebrow,
      frame: safeAreaFrame(pack, layout.eyebrow),
      textRole: 'eyebrow',
      style: buildTextStyle(typography, 'eyebrow', theme.mutedText),
      fit: {
        minFontSize: layout.eyebrowFont.min,
        maxFontSize: layout.eyebrowFont.max,
        maxLines: 1,
        align: layout.eyebrowAlign,
        verticalAlign: 'start'
      }
    },
    {
      type: 'text',
      id: 'title',
      text: copy.title,
      frame: safeAreaFrame(pack, layout.title),
      textRole: 'titleDisplay',
      style: buildTextStyle(typography, 'titleDisplay', theme.text),
      fit: {
        minFontSize: layout.titleFont.min,
        maxFontSize: layout.titleFont.max,
        maxLines: pack.contentPolicy.titleMaxLines,
        align: layout.titleAlign,
        verticalAlign: 'start'
      }
    }
  ];

  if (summary) {
    layers.push({
      type: 'text',
      id: 'summary',
      text: summary,
      frame: safeAreaFrame(pack, layout.summary),
      textRole: 'body',
      style: buildTextStyle(typography, 'body', theme.mutedText),
      fit: {
        minFontSize: layout.summaryFont.min,
        maxFontSize: layout.summaryFont.max,
        maxLines: summaryMaxLines,
        align: layout.summaryAlign,
        verticalAlign: 'start'
      }
    });
  }

  if (subtitle) {
    layers.push({
      type: 'text',
      id: 'subtitle',
      text: subtitle,
      frame: safeAreaFrame(pack, layout.subtitle),
      textRole: 'subtitle',
      style: buildTextStyle(typography, 'subtitle', theme.text),
      fit: {
        minFontSize: layout.subtitleFont.min,
        maxFontSize: layout.subtitleFont.max,
        maxLines: pack.contentPolicy.subtitleMaxLines,
        align: layout.subtitleAlign,
        verticalAlign: 'start'
      }
    });
  }

  layers.push(
    ...layout.bottomDots.map((box, index) => ({
      type: 'shape',
      id: `bottom-dot-${index + 1}`,
      shape: 'orb',
      frame: safeAreaFrame(pack, box),
      fill: { kind: 'solid', color: theme.accent },
      opacity: 0.9
    }))
  );

  return layers;
}

function buildImageLayers({ pack, template, theme, typography, copy, project }) {
  const hero = heroImage(project);
  const canvas = pack.canvas;

  if (template.id === 'editorial-minimal' || template.id === 'editorial-cover') {
    return buildCleanEditorialLayers({ pack, theme, typography, copy });
  }

  return [
    ...backgroundLayers(theme),
    { type: 'shape', shape: 'speech', frame: percentFrame(canvas, { x: 0.07, y: 0.08, width: 0.66, height: 0.44 }), fill: { kind: 'solid', color: 'rgba(255,255,255,0.92)' }, stroke: { color: theme.text, width: 4 } },
    { type: 'text', id: 'title', text: copy.title, frame: percentFrame(canvas, { x: 0.12, y: 0.14, width: 0.54, height: 0.3 }), textRole: 'titleTight', style: buildTextStyle(typography, 'titleTight', '#0f172a'), fit: { minFontSize: 40, maxFontSize: 106, maxLines: pack.contentPolicy.titleMaxLines, align: 'left', verticalAlign: 'start' } },
    { type: 'text', id: 'subtitle', text: lineClamp(copy.subtitle || copy.summary, 100), frame: percentFrame(canvas, { x: 0.09, y: 0.58, width: 0.58, height: 0.16 }), textRole: 'subtitle', style: buildTextStyle(typography, 'subtitle', theme.text), fit: { minFontSize: 24, maxFontSize: 44, maxLines: pack.contentPolicy.subtitleMaxLines, align: 'left', verticalAlign: 'start' } },
    { type: 'shape', shape: 'burst', frame: percentFrame(canvas, { x: 0.7, y: 0.12, width: 0.2, height: 0.16 }), fill: { kind: 'solid', color: theme.accent } },
    hero ? { type: 'image', id: 'hero', src: hero.path, frame: percentFrame(canvas, { x: 0.58, y: 0.62, width: 0.28, height: 0.24 }), fit: 'cover', borderRadius: 28 } : { type: 'shape', shape: 'panel', frame: percentFrame(canvas, { x: 0.58, y: 0.62, width: 0.28, height: 0.24 }), fill: { kind: 'glass', color: theme.accent2Soft }, stroke: { color: 'rgba(255,255,255,0.18)', width: 2 } },
    { type: 'text', id: 'badge', text: '漫画拆解', frame: percentFrame(canvas, { x: 0.1, y: 0.82, width: 0.24, height: 0.06 }), textRole: 'badge', style: buildTextStyle(typography, 'badge', theme.text), fit: { minFontSize: 16, maxFontSize: 28, maxLines: 1, align: 'center', verticalAlign: 'center' }, background: { color: theme.accentSoft, radius: 999 } }
  ];
}

export function buildRenderModel(project, targetRef) {
  const target = typeof targetRef === 'string' ? getTargetSpec(project, targetRef) : targetRef;
  const pack = getPlatformPack(target.platform);
  const template = assertTemplateCompatible(target.template, target.platform);
  const effectiveThemeId = target.overrides.theme || project.style.theme || getTemplate(template.id).defaultTheme;
  const theme = getTheme(effectiveThemeId || template.defaultTheme);
  const typography = getTypographyProfile(project.style.fontProfile || template.fontProfile);
  const copy = baseCopy(project, target);

  if (pack.kind === 'article') {
    return {
      kind: 'article',
      projectId: project.projectId,
      target,
      pack,
      template,
      theme,
      typography,
      assets: project.assets.images,
      article: {
        title: copy.title,
        subtitle: copy.subtitle,
        summary: copy.summary,
        blocks: project.source.body
      }
    };
  }

  return {
    kind: 'image',
    projectId: project.projectId,
    target,
    pack,
    template,
    theme,
    typography,
    canvas: pack.canvas,
    safeArea: pack.canvas.safeArea,
    layers: buildImageLayers({ pack, template, theme, typography, copy, project })
  };
}
