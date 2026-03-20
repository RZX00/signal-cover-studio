# Examples

## `specs/fundraising.json`

Reference fixture covering all supported targets:

- `wechat-cover`
- `wechat-article`
- `xhs-cover`
- `x-post`

It also includes:

- body blocks for article rendering
- a local SVG hero asset
- keywords for metadata/badge generation

Use it for smoke tests, CI, and as a copyable starting point when you already want full control over the spec.

## `content/fundraising.md`

Source-first workflow fixture for the end-to-end pipeline.

Use it when you want to start from Markdown content and let `cover-edit scaffold` / `cover-edit workflow` generate:

- a normalized `ProjectSpec`
- the 3 visual exports
- the WeChat article HTML
- validation + manifest files
