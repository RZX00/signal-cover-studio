import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { loadProjectSpecFile } from './project-loader.js';
import { validateTarget } from './validate.js';
import { bundleProjectTargets } from './render.js';
import { writeScaffoldedSpec } from './content-source.js';

function hasValidationErrors(results) {
  return results.some((item) => (item.issues || []).some((issue) => issue.level === 'error'));
}

export async function validateProjectTargets({ rootDir, projectBundle, targetRefs }) {
  const refs = targetRefs?.length ? targetRefs : projectBundle.project.targets.map((target) => target.id);
  const results = [];
  for (const targetRef of refs) {
    results.push(await validateTarget({ rootDir, projectBundle, targetRef }));
  }
  return results;
}

export async function runWorkflow({
  rootDir,
  sourcePath,
  outDir,
  scaffoldOptions = {},
  specOutFile = '',
  strict = false
}) {
  const absoluteOutDir = path.resolve(outDir || 'dist/workflow');
  await mkdir(absoluteOutDir, { recursive: true });

  const resolvedSpecOut = path.resolve(specOutFile || path.join(absoluteOutDir, 'project.spec.json'));
  const scaffolded = await writeScaffoldedSpec({ sourcePath, options: scaffoldOptions, outFile: resolvedSpecOut });
  const projectBundle = await loadProjectSpecFile(resolvedSpecOut);
  const validations = await validateProjectTargets({ rootDir, projectBundle });
  const validationPath = path.join(absoluteOutDir, 'validation.json');
  await writeFile(validationPath, JSON.stringify({ projectId: projectBundle.project.projectId, validations }, null, 2), 'utf8');

  if (strict && hasValidationErrors(validations)) {
    const error = new Error(`Workflow validation failed for ${projectBundle.project.projectId}`);
    error.validationPath = validationPath;
    error.validations = validations;
    throw error;
  }

  const outputs = await bundleProjectTargets({ rootDir, projectBundle, outDir: absoluteOutDir });
  const manifest = {
    projectId: projectBundle.project.projectId,
    sourcePath: path.resolve(sourcePath),
    specPath: resolvedSpecOut,
    validationPath,
    outputs,
    validations
  };
  const manifestPath = path.join(absoluteOutDir, 'manifest.json');
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  return {
    manifestPath,
    specPath: resolvedSpecOut,
    validationPath,
    outputs,
    validations,
    sourcePath: scaffolded.sourcePath,
    project: projectBundle.project
  };
}
