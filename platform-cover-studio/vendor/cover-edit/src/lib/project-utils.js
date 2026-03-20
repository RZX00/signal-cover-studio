import { CoverEditError } from './errors.js';

export function getTargetSpec(projectSpec, targetIdOrPlatform) {
  const target = projectSpec.targets.find((item) => item.id === targetIdOrPlatform || item.platform === targetIdOrPlatform) || projectSpec.targets[0];
  if (!target) throw new CoverEditError('Project spec has no targets');
  return target;
}
