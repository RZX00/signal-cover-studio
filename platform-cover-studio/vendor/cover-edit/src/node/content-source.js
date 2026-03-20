import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { normalizeProjectSpec, getPlatformPack } from '../lib/index.js';
import { slugify, lineClamp } from '../lib/utils.js';

const ALL_TARGETS = ['wechat-cover', 'wechat-article', 'xhs-cover', 'x-post'];

function normalizePathForSpec(filePath) {
  return filePath.split(path.sep).join('/');
}

function parseBooleanish(value) {
  if (typeof value !== 'string') return value;
  if (/^(true|false)$/i.test(value.trim())) return value.trim().toLowerCase() === 'true';
  return value.trim();
}

function splitCsv(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (!value) return [];
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseTargetList(value) {
  if (!value || value === 'all') return [...ALL_TARGETS];
  const targets = splitCsv(value);
  return targets.length ? targets : [...ALL_TARGETS];
}

export function parseTemplateMap(value) {
  if (!value) return {};
  if (typeof value === 'object' && !Array.isArray(value)) return value;
  return String(value)
    .split(',')
    .map((pair) => pair.trim())
    .filter(Boolean)
    .reduce((acc, pair) => {
      const [platform, template] = pair.split('=').map((item) => item?.trim());
      if (platform && template) acc[platform] = template;
      return acc;
    }, {});
}

function parseFrontmatter(input) {
  const text = input.replace(/\r\n/g, '\n');
  if (!text.startsWith('---\n')) return { attributes: {}, body: text };

  const endMarker = text.indexOf('\n---\n', 4);
  if (endMarker === -1) return { attributes: {}, body: text };

  const rawFrontmatter = text.slice(4, endMarker).split('\n');
  const body = text.slice(endMarker + 5);
  const attributes = {};
  let currentKey = null;

  for (const rawLine of rawFrontmatter) {
    const line = rawLine.replace(/\t/g, '  ');
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const keyMatch = line.match(/^([A-Za-z0-9_.-]+):\s*(.*)$/);
    if (keyMatch) {
      const [, key, rawValue] = keyMatch;
      currentKey = key;
      if (!rawValue.trim()) {
        attributes[key] = [];
      } else {
        attributes[key] = parseBooleanish(rawValue);
      }
      continue;
    }

    const listMatch = line.match(/^\s*-\s+(.+)$/);
    if (listMatch && currentKey) {
      if (!Array.isArray(attributes[currentKey])) attributes[currentKey] = [];
      attributes[currentKey].push(parseBooleanish(listMatch[1]));
      continue;
    }

    if (currentKey && line.trim()) {
      const current = attributes[currentKey];
      if (Array.isArray(current)) current.push(parseBooleanish(line.trim()));
      else attributes[currentKey] = `${current}\n${line.trim()}`;
    }
  }

  return { attributes, body };
}

function flushParagraph(buffer, blocks, type = 'paragraph') {
  if (!buffer.length) return;
  blocks.push({ type, text: buffer.join(' ').replace(/\s+/g, ' ').trim() });
  buffer.length = 0;
}

function parseMarkdownBlocks(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  const assets = [];
  const paragraph = [];
  const quote = [];
  const list = [];
  let extractedTitle = '';
  let extractedSubtitle = '';
  let inCodeBlock = false;
  let codeFence = '```';
  let codeLines = [];
  let imageCount = 0;

  const flushQuote = () => {
    if (!quote.length) return;
    blocks.push({ type: 'quote', text: quote.join(' ').replace(/\s+/g, ' ').trim() });
    quote.length = 0;
  };

  const flushList = () => {
    if (!list.length) return;
    blocks.push({ type: 'list', items: [...list] });
    list.length = 0;
  };

  const flushAllText = () => {
    flushParagraph(paragraph, blocks);
    flushQuote();
    flushList();
  };

  for (const rawLine of lines) {
    const line = rawLine.replace(/\t/g, '  ');
    const trimmed = line.trim();

    if (inCodeBlock) {
      if (trimmed.startsWith(codeFence)) {
        blocks.push({ type: 'code', text: codeLines.join('\n') });
        inCodeBlock = false;
        codeLines = [];
        continue;
      }
      codeLines.push(rawLine);
      continue;
    }

    if (trimmed.startsWith('```')) {
      flushAllText();
      inCodeBlock = true;
      codeFence = trimmed.slice(0, 3);
      codeLines = [];
      continue;
    }

    if (!trimmed) {
      flushAllText();
      continue;
    }

    const imageMatch = trimmed.match(/^!\[(.*?)\]\((.+?)\)$/);
    if (imageMatch) {
      flushAllText();
      imageCount += 1;
      const assetId = `inline-image-${imageCount}`;
      const [, alt, src] = imageMatch;
      assets.push({ id: assetId, path: src.trim(), role: 'inline', alt: alt.trim() || `Inline image ${imageCount}` });
      blocks.push({ type: 'image', assetId, caption: alt.trim() });
      continue;
    }

    if (/^---+$/.test(trimmed)) {
      flushAllText();
      blocks.push({ type: 'divider' });
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      flushAllText();
      const [, hashes, text] = headingMatch;
      if (hashes.length === 1 && !extractedTitle) {
        extractedTitle = text.trim();
      } else if (hashes.length === 2 && !extractedSubtitle) {
        extractedSubtitle = text.trim();
      } else {
        blocks.push({ type: hashes.length === 2 ? 'title' : 'subtitle', text: text.trim() });
      }
      continue;
    }

    if (trimmed.startsWith('>')) {
      flushParagraph(paragraph, blocks);
      flushList();
      quote.push(trimmed.replace(/^>\s?/, ''));
      continue;
    }

    const listMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (listMatch) {
      flushParagraph(paragraph, blocks);
      flushQuote();
      list.push(listMatch[1].trim());
      continue;
    }

    paragraph.push(trimmed);
  }

  if (inCodeBlock && codeLines.length) blocks.push({ type: 'code', text: codeLines.join('\n') });
  flushAllText();

  return { blocks, assets, extractedTitle, extractedSubtitle };
}

function ensureLeadAndSummary(blocks, summary) {
  const nextBlocks = structuredClone(blocks);
  const firstParagraphIndex = nextBlocks.findIndex((block) => block.type === 'paragraph');
  if (!summary && firstParagraphIndex >= 0) {
    nextBlocks[firstParagraphIndex].type = 'lead';
    return {
      summary: lineClamp(nextBlocks[firstParagraphIndex].text, 86),
      blocks: nextBlocks
    };
  }
  return { summary, blocks: nextBlocks };
}

function inferTitleFromBody(blocks, fallback) {
  const leadish = blocks.find((block) => block.type === 'lead' || block.type === 'paragraph');
  return lineClamp(leadish?.text || fallback || 'Untitled project', 28);
}

function buildTargets(platforms, templateMap = {}, existingTargets = []) {
  const existingByPlatform = new Map(existingTargets.map((target) => [target.platform, target]));
  return platforms.map((platform) => {
    const existing = existingByPlatform.get(platform);
    return {
      id: existing?.id || platform,
      platform,
      template: templateMap[platform] || existing?.template || getPlatformPack(platform).defaultTemplate,
      output: { format: platform === 'wechat-article' ? 'html' : 'png' },
      ...(existing?.variant ? { variant: existing.variant } : {}),
      ...(existing?.overrides ? { overrides: existing.overrides } : {})
    };
  });
}

function upsertHeroAsset(images, heroPath, fallbackAlt) {
  if (!heroPath) return images;
  const next = [...images];
  const index = next.findIndex((asset) => asset.role === 'hero');
  const heroAsset = {
    id: next[index]?.id || 'hero-image',
    path: heroPath,
    role: 'hero',
    alt: next[index]?.alt || fallbackAlt || 'Hero image'
  };

  if (index >= 0) next[index] = heroAsset;
  else next.unshift(heroAsset);
  return next;
}

function scaffoldFromMarkdown(raw, sourcePath, options = {}) {
  const { attributes, body } = parseFrontmatter(raw);
  const parsed = parseMarkdownBlocks(body);
  const preferredTargets = parseTargetList(options.targets || attributes.targets);
  const templateMap = {
    ...parseTemplateMap(attributes.templates),
    ...parseTemplateMap(options.templateMap)
  };

  const title = options.title || attributes.title || parsed.extractedTitle || inferTitleFromBody(parsed.blocks, path.parse(sourcePath).name);
  const subtitle = options.subtitle || attributes.subtitle || parsed.extractedSubtitle || '';
  const leadResult = ensureLeadAndSummary(parsed.blocks, options.summary || attributes.summary || '');
  const keywords = splitCsv(options.keywords || attributes.keywords || attributes.tags);
  const images = upsertHeroAsset(parsed.assets, options.hero || attributes.hero || '', title);

  return {
    version: '1.0',
    projectId: options.projectId || attributes.projectId || slugify(path.parse(sourcePath).name),
    locale: options.locale || attributes.locale || attributes.language || 'zh-CN',
    source: {
      title,
      subtitle,
      summary: leadResult.summary,
      body: leadResult.blocks,
      keywords,
      language: options.language || attributes.language || 'zh-CN'
    },
    assets: { images },
    style: {
      theme: options.theme || attributes.theme || '',
      mood: options.mood || attributes.mood || 'editorial',
      density: options.density || attributes.density || 'medium',
      contrast: options.contrast || attributes.contrast || 'high',
      fontProfile: options.fontProfile || attributes.fontProfile || '',
      allowIllustration: options.allowIllustration ?? attributes.allowIllustration ?? true,
      allowSpeechBubble: options.allowSpeechBubble ?? attributes.allowSpeechBubble ?? templateMap['xhs-cover'] === 'comic-explainer'
    },
    targets: buildTargets(preferredTargets, templateMap)
  };
}

function scaffoldFromPlainText(raw, sourcePath, options = {}) {
  const paragraphs = raw
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
  const title = options.title || lineClamp(paragraphs[0] || path.parse(sourcePath).name, 28);
  const subtitle = options.subtitle || lineClamp(paragraphs[1] || '', 42);
  const body = paragraphs.slice(1).map((text, index) => ({ type: index === 0 ? 'lead' : 'paragraph', text }));

  return {
    version: '1.0',
    projectId: options.projectId || slugify(path.parse(sourcePath).name),
    locale: options.locale || 'zh-CN',
    source: {
      title,
      subtitle,
      summary: options.summary || lineClamp(body[0]?.text || subtitle || title, 86),
      body,
      keywords: splitCsv(options.keywords),
      language: options.language || 'zh-CN'
    },
    assets: {
      images: upsertHeroAsset([], options.hero || '', title)
    },
    style: {
      theme: options.theme || '',
      mood: options.mood || 'editorial',
      density: options.density || 'medium',
      contrast: options.contrast || 'high',
      fontProfile: options.fontProfile || '',
      allowIllustration: true,
      allowSpeechBubble: false
    },
    targets: buildTargets(parseTargetList(options.targets), parseTemplateMap(options.templateMap))
  };
}

function applyProjectOverrides(projectInput, options = {}) {
  const next = structuredClone(projectInput);
  if (options.projectId) next.projectId = options.projectId;
  next.locale = options.locale || next.locale || next.source?.language || 'zh-CN';
  next.style = {
    theme: options.theme || next.style?.theme || '',
    mood: options.mood || next.style?.mood || 'editorial',
    density: options.density || next.style?.density || 'medium',
    contrast: options.contrast || next.style?.contrast || 'high',
    fontProfile: options.fontProfile || next.style?.fontProfile || '',
    allowIllustration: options.allowIllustration ?? next.style?.allowIllustration ?? true,
    allowSpeechBubble: options.allowSpeechBubble ?? next.style?.allowSpeechBubble ?? false
  };

  const source = next.source || {};
  next.source = {
    ...source,
    title: options.title || source.title,
    subtitle: options.subtitle || source.subtitle || '',
    summary: options.summary || source.summary || '',
    keywords: splitCsv(options.keywords || source.keywords),
    language: options.language || source.language || next.locale,
    body: Array.isArray(source.body) ? source.body : []
  };

  next.assets = next.assets || { images: [] };
  next.assets.images = upsertHeroAsset(next.assets.images || [], options.hero || '', next.source.title);

  const requestedTargets = options.targets ? parseTargetList(options.targets) : next.targets?.map((target) => target.platform) || ALL_TARGETS;
  next.targets = buildTargets(requestedTargets, parseTemplateMap(options.templateMap), next.targets || []);
  return next;
}

function materializeAssetPaths(projectInput, sourceBaseDir, specDir) {
  const next = structuredClone(projectInput);
  next.assets = next.assets || { images: [] };
  next.assets.images = (next.assets.images || []).map((asset) => {
    const absolutePath = path.isAbsolute(asset.path) ? asset.path : path.resolve(sourceBaseDir, asset.path);
    const relativePath = path.relative(specDir, absolutePath) || path.basename(absolutePath);
    return {
      ...asset,
      path: normalizePathForSpec(relativePath.startsWith('.') ? relativePath : `./${relativePath}`)
    };
  });
  return next;
}

function looksLikeProjectSpec(value) {
  return Boolean(value && typeof value === 'object' && value.version && value.projectId && value.source && value.targets);
}

export async function scaffoldProjectInputFromSourceFile(sourcePath, options = {}) {
  const absoluteSourcePath = path.resolve(sourcePath);
  const raw = await readFile(absoluteSourcePath, 'utf8');
  const ext = path.extname(absoluteSourcePath).toLowerCase();
  const sourceBaseDir = path.dirname(absoluteSourcePath);

  if (ext === '.json') {
    const parsed = JSON.parse(raw);
    if (looksLikeProjectSpec(parsed)) {
      return {
        sourcePath: absoluteSourcePath,
        sourceBaseDir,
        projectInput: applyProjectOverrides(parsed, options)
      };
    }

    return {
      sourcePath: absoluteSourcePath,
      sourceBaseDir,
      projectInput: applyProjectOverrides(parsed, options)
    };
  }

  if (ext === '.md' || ext === '.markdown') {
    return {
      sourcePath: absoluteSourcePath,
      sourceBaseDir,
      projectInput: scaffoldFromMarkdown(raw, absoluteSourcePath, options)
    };
  }

  return {
    sourcePath: absoluteSourcePath,
    sourceBaseDir,
    projectInput: scaffoldFromPlainText(raw, absoluteSourcePath, options)
  };
}

export async function writeScaffoldedSpec({ sourcePath, options = {}, outFile }) {
  const scaffolded = await scaffoldProjectInputFromSourceFile(sourcePath, options);
  const outputPath = path.resolve(outFile);
  await mkdir(path.dirname(outputPath), { recursive: true });
  const materialized = materializeAssetPaths(scaffolded.projectInput, scaffolded.sourceBaseDir, path.dirname(outputPath));
  const project = normalizeProjectSpec(materialized);
  await writeFile(outputPath, JSON.stringify(project, null, 2), 'utf8');
  return { ...scaffolded, outputPath, project };
}

export async function loadScaffoldedProjectBundle({ sourcePath, options = {} }) {
  const scaffolded = await scaffoldProjectInputFromSourceFile(sourcePath, options);
  const project = normalizeProjectSpec(scaffolded.projectInput);
  return {
    specPath: null,
    specDir: scaffolded.sourceBaseDir,
    sourcePath: scaffolded.sourcePath,
    project
  };
}
