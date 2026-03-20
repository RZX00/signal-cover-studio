# cover-edit

Spec-first multi-platform content packaging tool for:

- `wechat-cover`
- `wechat-article`
- `xhs-cover`
- `x-post`

It ships with:

- normalized `ProjectSpec` schema
- platform packs + template registry
- browser studio preview
- headless Playwright renderer
- CLI for `render`, `bundle`, `validate`
- safe-area / text-overflow validation
- standalone WeChat article HTML export
- local-font strategy with no Google Fonts dependency
- default acceptance visuals now use the original clean gradient + typography direction
- CI fixture rendering

## Install

```bash
npm install
npx playwright install chromium
```

## Run the browser studio

```bash
npm run dev
```

Open <http://127.0.0.1:4173>.

## CLI

```bash
node bin/cover-edit.mjs render --spec examples/specs/fundraising.json --target x-post --out dist/x-post.png
node bin/cover-edit.mjs bundle --spec examples/specs/fundraising.json --out-dir dist/out
node bin/cover-edit.mjs validate --spec examples/specs/fundraising.json --all --json
node bin/cover-edit.mjs scaffold --source examples/content/fundraising.md --out dist/project.spec.json
node bin/cover-edit.mjs workflow --source examples/content/fundraising.md --out-dir dist/acceptance/fundraising --strict
```

## Example workflow

```bash
npm run ci
npm run example:workflow
```

- `npm run ci` runs syntax checks, unit tests, validates every target on the fixture spec, and renders a full bundle into `dist/ci`.
- `npm run example:workflow` starts from Markdown content, scaffolds a normalized spec, validates all targets, and renders the 3 image assets plus article HTML into `dist/acceptance/fundraising`.

## OpenClaw skill wrapper

A repo-local skill wrapper now lives at:

- `skills/signal-cover-studio/SKILL.md`
- `skills/signal-cover-studio/scripts/run_cover_workflow.mjs`

Run it directly:

```bash
node skills/signal-cover-studio/scripts/run_cover_workflow.mjs \
  --source examples/content/fundraising.md \
  --out-dir dist/skill-demo \
  --strict
```

## Project spec shape

See:

- `schemas/project.schema.json`
- `docs/USAGE.md`
- `examples/specs/fundraising.json`

Core top-level keys:

- `version`
- `projectId`
- `source`
- `assets`
- `style`
- `targets`

## Templates

- `editorial-minimal`
- `editorial-cover`
- `comic-explainer` (optional playful variant, no longer the default acceptance path)
- `wechat-article-clean`

## Local font strategy

No remote fonts are loaded.

See `assets/fonts/README.md` for the stack and CI notes.

## Notes

- Image targets render deterministically through Playwright screenshots.
- Article targets export standalone HTML with inline CSS.
- Validation treats text overflow and safe-area violations as errors, and hitting the minimum fitted font size as a warning.
