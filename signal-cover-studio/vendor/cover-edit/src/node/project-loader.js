import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { normalizeProjectSpec, getTargetSpec } from '../lib/index.js';
import { encodeFileUrl } from './server.js';

function resolveAssetPath(specDir, assetPath) {
  if (!assetPath) return assetPath;
  return path.isAbsolute(assetPath) ? assetPath : path.resolve(specDir, assetPath);
}

export async function loadProjectSpecFile(specPath) {
  const absoluteSpecPath = path.resolve(specPath);
  const raw = await readFile(absoluteSpecPath, 'utf8');
  const input = JSON.parse(raw);
  const project = normalizeProjectSpec(input);
  return {
    specPath: absoluteSpecPath,
    specDir: path.dirname(absoluteSpecPath),
    project
  };
}

export function prepareBrowserProject(project, specDir) {
  const browserProject = structuredClone(project);
  browserProject.assets.images = browserProject.assets.images.map((asset) => ({
    ...asset,
    absolutePath: resolveAssetPath(specDir, asset.path),
    path: encodeFileUrl(resolveAssetPath(specDir, asset.path))
  }));
  return browserProject;
}

function mimeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.svg') return 'image/svg+xml';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  return 'application/octet-stream';
}

export async function inlineProjectAssets(project, specDir) {
  const inlineProject = structuredClone(project);
  inlineProject.assets.images = await Promise.all(inlineProject.assets.images.map(async (asset) => {
    const absolutePath = resolveAssetPath(specDir, asset.path);
    const buffer = await readFile(absolutePath);
    return {
      ...asset,
      absolutePath,
      path: `data:${mimeFor(absolutePath)};base64,${buffer.toString('base64')}`
    };
  }));
  return inlineProject;
}

export function resolveOutputPath(target, outFile, outDir) {
  if (outFile) return path.resolve(outFile);
  const ext = target.output.format === 'jpg' ? 'jpg' : target.output.format;
  const baseDir = path.resolve(outDir || 'dist');
  return path.join(baseDir, `${target.slug}.${ext}`);
}

export function getTarget(project, targetRef) {
  return getTargetSpec(project, targetRef);
}
