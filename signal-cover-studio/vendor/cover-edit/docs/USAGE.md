# Usage

## 1. Start from a spec

Copy `examples/specs/fundraising.json` and edit it.

Minimal spec:

```json
{
  "version": "1.0",
  "projectId": "demo-project",
  "source": {
    "title": "你的标题",
    "subtitle": "你的副标题",
    "summary": "一句总结"
  },
  "targets": [
    { "platform": "x-post", "template": "editorial-cover" }
  ]
}
```

## 2. Start from content instead of JSON

If you have Markdown or plain text, scaffold a normalized spec first:

```bash
node bin/cover-edit.mjs scaffold \
  --source examples/content/fundraising.md \
  --out dist/project.spec.json
```

You can also override the generated targets or templates at the CLI layer:

```bash
node bin/cover-edit.mjs scaffold \
  --source examples/content/fundraising.md \
  --targets wechat-cover,wechat-article,xhs-cover,x-post \
  --template-map wechat-cover=editorial-minimal,wechat-article=wechat-article-clean,xhs-cover=editorial-cover,x-post=editorial-cover \
  --theme soft-gradient-editorial \
  --out dist/project.spec.json
```

`cover-edit export-spec` is an alias for `scaffold`.

## 3. Platform packs

### Image packs

- `wechat-cover` → `900x383`
- `xhs-cover` → `1200x1600`
- `x-post` → `1600x1200`

Each image pack includes a safe area used by validation.

### Article pack

- `wechat-article` → standalone HTML output

## 4. Templates

### `editorial-minimal`
Best for concise statements in the clean gradient baseline.

### `editorial-cover`
Magazine-cover typography on the original soft gradient baseline. Platform differences are mostly layout/ratio changes.

### `comic-explainer`
Speech-bubble and badge-driven explanatory cover. Use only when you explicitly want a louder, playful variant.

### `wechat-article-clean`
Readable long-form article layout for WeChat-style posts.

## 5. Body block schema

Supported block types:

- `title`
- `subtitle`
- `lead`
- `paragraph`
- `quote`
- `list`
- `divider`
- `image`
- `callout`
- `code`

Example:

```json
[
  { "type": "lead", "text": "先讲结论。" },
  { "type": "paragraph", "text": "再展开细节。" },
  { "type": "quote", "text": "一句适合拎出来的判断。" },
  { "type": "list", "items": ["第一点", "第二点", "第三点"] }
]
```

## 6. Validate before shipping

Validate one target:

```bash
node bin/cover-edit.mjs validate --spec examples/specs/fundraising.json --target x-post --json
```

Validate the whole pack:

```bash
node bin/cover-edit.mjs validate --spec examples/specs/fundraising.json --all --json
```

Validation reports:

- safe-area violations
- text overflow
- minimum fitted font warnings
- article title/body sanity checks

## 7. Render one target

```bash
node bin/cover-edit.mjs render --spec examples/specs/fundraising.json --target xhs-cover --out dist/xhs-cover.png
```

## 8. Bundle all targets from a spec

```bash
node bin/cover-edit.mjs bundle --spec examples/specs/fundraising.json --out-dir dist/bundle
```

Outputs are written alongside `manifest.json`.

## 9. Run the full workflow from content

This is the one-command path for real usage:

```bash
node bin/cover-edit.mjs workflow \
  --source examples/content/fundraising.md \
  --out-dir dist/acceptance/fundraising \
  --strict
```

Workflow output includes:

- `project.spec.json`
- `validation.json`
- `manifest.json`
- `wechat-cover.png`
- `xhs-cover.png`
- `x-post.png`
- `wechat-article.html`
