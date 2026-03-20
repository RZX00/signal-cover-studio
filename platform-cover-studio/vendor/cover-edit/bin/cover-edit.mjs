#!/usr/bin/env node
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadProjectSpecFile } from '../src/node/project-loader.js';
import { renderTargetToFile, bundleProjectTargets } from '../src/node/render.js';
import { validateTarget } from '../src/node/validate.js';
import { writeScaffoldedSpec } from '../src/node/content-source.js';
import { runWorkflow, validateProjectTargets } from '../src/node/workflow.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const command = args[0];

function readFlag(name, fallback = '') {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : fallback;
}

function hasFlag(name) {
  return args.includes(name);
}

function readScaffoldOptions() {
  return {
    projectId: readFlag('--project-id', ''),
    title: readFlag('--title', ''),
    subtitle: readFlag('--subtitle', ''),
    summary: readFlag('--summary', ''),
    language: readFlag('--language', ''),
    locale: readFlag('--locale', ''),
    keywords: readFlag('--keywords', ''),
    targets: readFlag('--targets', ''),
    templateMap: readFlag('--template-map', ''),
    theme: readFlag('--theme', ''),
    mood: readFlag('--mood', ''),
    density: readFlag('--density', ''),
    contrast: readFlag('--contrast', ''),
    fontProfile: readFlag('--font-profile', ''),
    hero: readFlag('--hero', '')
  };
}

function printUsage() {
  console.log(`cover-edit

Usage:
  cover-edit render --spec <file> [--target <id>] [--out <file>]
  cover-edit bundle --spec <file> [--out-dir <dir>]
  cover-edit validate --spec <file> [--target <id> | --all] [--json]
  cover-edit scaffold --source <file> [--out <file>] [--targets <csv>] [--template-map <csv>]
  cover-edit export-spec --source <file> [--out <file>] [--targets <csv>] [--template-map <csv>]
  cover-edit workflow --source <file> [--out-dir <dir>] [--spec-out <file>] [--strict]

Scaffold / workflow options:
  --project-id <id>
  --title <text>
  --subtitle <text>
  --summary <text>
  --keywords <csv>
  --targets <csv|all>
  --template-map <platform=template,...>
  --theme <id>
  --font-profile <id>
  --hero <path>
`);
}

async function run() {
  if (!command || hasFlag('--help') || hasFlag('-h')) {
    printUsage();
    return;
  }

  if (command === 'scaffold' || command === 'export-spec') {
    const sourcePath = readFlag('--source');
    if (!sourcePath) {
      printUsage();
      process.exitCode = 1;
      return;
    }
    const outFile = readFlag('--out', 'dist/project.spec.json');
    const result = await writeScaffoldedSpec({ sourcePath, options: readScaffoldOptions(), outFile });
    console.log(JSON.stringify({ outputPath: result.outputPath, projectId: result.project.projectId, targets: result.project.targets }, null, 2));
    return;
  }

  if (command === 'workflow') {
    const sourcePath = readFlag('--source') || readFlag('--spec');
    if (!sourcePath) {
      printUsage();
      process.exitCode = 1;
      return;
    }
    const payload = await runWorkflow({
      rootDir,
      sourcePath,
      outDir: readFlag('--out-dir', 'dist/workflow'),
      specOutFile: readFlag('--spec-out', ''),
      scaffoldOptions: readScaffoldOptions(),
      strict: hasFlag('--strict')
    });
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  const specPath = readFlag('--spec');
  if (!specPath) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const bundle = await loadProjectSpecFile(specPath);

  if (command === 'render') {
    const targetRef = readFlag('--target', bundle.project.targets[0].id);
    const outFile = readFlag('--out', '');
    const result = await renderTargetToFile({ rootDir, projectBundle: bundle, targetRef, outFile });
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (command === 'bundle') {
    const outDir = readFlag('--out-dir', 'dist');
    const outputs = await bundleProjectTargets({ rootDir, projectBundle: bundle, outDir });
    const manifestPath = path.resolve(outDir, 'manifest.json');
    await writeFile(manifestPath, JSON.stringify({ projectId: bundle.project.projectId, outputs }, null, 2), 'utf8');
    console.log(JSON.stringify({ manifestPath, outputs }, null, 2));
    return;
  }

  if (command === 'validate') {
    if (hasFlag('--all')) {
      const validations = await validateProjectTargets({ rootDir, projectBundle: bundle });
      const ok = validations.every((item) => item.ok);
      if (hasFlag('--json')) console.log(JSON.stringify({ ok, validations }, null, 2));
      else validations.forEach((item) => console.log(`${item.ok ? 'OK' : 'FAIL'} ${item.targetId}: ${item.issues.length} issues`));
      if (!ok) process.exitCode = 1;
      return;
    }

    const targetRef = readFlag('--target', bundle.project.targets[0].id);
    const payload = await validateTarget({ rootDir, projectBundle: bundle, targetRef });
    if (hasFlag('--json')) console.log(JSON.stringify(payload, null, 2));
    else console.log(`${payload.ok ? 'OK' : 'FAIL'} ${payload.targetId}: ${payload.issues.length} issues`);
    if (!payload.ok) process.exitCode = 1;
    return;
  }

  printUsage();
  process.exitCode = 1;
}

run().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exitCode = 1;
});
