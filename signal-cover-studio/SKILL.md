---
name: signal-cover-studio
description: Self-contained multi-platform editorial cover workflow. Use when the user wants to turn one Markdown/text/article source into a Xiaohongshu cover, WeChat cover, X image, and optionally WeChat article HTML with a validated, reusable editorial system.
---

# signal-cover-studio

Use this skill when the user wants a **cross-platform editorial cover bundle** from one content source.

This packaged release includes:

- the skill wrapper
- the editorial layout rules
- a vendored `cover-edit` runtime under `vendor/cover-edit/`
- the local Node dependencies needed by that runtime

## What it does

- scaffold a normalized `ProjectSpec` from Markdown / plain text / JSON
- validate safe area, clipping, and text overflow before delivery
- render:
  - `wechat-cover`
  - `wechat-article`
  - `xhs-cover`
  - `x-post`
- preserve the approved editorial layout system and theme/font exploration workflow

## Trigger when the user wants

- 微信公众号封面
- 微信文章 HTML
- 小红书封面 / 首图
- X / Twitter 配图
- 一次性出三平台素材包
- 同版式下切换不同主题 / 渐变 / 标题字体

Do **not** use this skill for pure textless image generation. This is a content-packaging skill, not a generic image model wrapper.

## First read order

1. `references/cover-layout-rules.md` — final accepted composition rules
2. `references/platforms.md` — platform sizes / safe area reminders
3. `references/templates.md` — template choices
4. `references/troubleshooting.md` — only when validation or rendering fails

## Final accepted layout rules

Treat these as the default source of truth for the approved visual system:

- two visual poles, not four-corner occupancy
- upper-left main block: eyebrow + title + subtitle
- lower-right secondary block: summary only
- title + subtitle stay left-aligned in one family
- summary stays right-aligned in the lower-right counterweight block
- right outer margin must match left outer margin
- title should be large, subtitle also visibly large
- subtitle should sit closer to title than a generic template would
- for XHS and X, eyebrow labels can be much larger than timid micro-labels
- for WeChat cover, title may need to be slightly larger than the default cross-platform setting
- no comic bubbles, badges, dot matrix, top-left horizontal lines, or decorative clutter unless explicitly requested
- hard-fail clipping / safe-area / overflow issues

## Primary command

```bash
node scripts/run_cover_workflow.mjs \
  --source vendor/cover-edit/examples/content/fundraising.md \
  --out-dir ../../dist/skill-runs/platform-cover-demo \
  --strict
```

Useful overrides:

- `--targets wechat-cover,wechat-article,xhs-cover,x-post`
- `--template-map wechat-cover=editorial-minimal,wechat-article=wechat-article-clean,xhs-cover=editorial-cover,x-post=editorial-cover`
- `--theme dark-green-editorial`
- `--theme blue-violet-editorial`
- `--theme emerald-editorial`
- `--theme rose-editorial`
- `--theme amber-night-editorial`
- `--theme paper-ink`
- `--theme soft-gradient-editorial`
- `--project-id custom-id`

## Typography profiles worth trying

- `gradient-cover-cn-en` — clean default sans
- `title-serif-cn-en` — more magazine / editorial / bookish
- `title-heavy-sans-cn-en` — harder, more modern, more assertive

## Output contract

Expect these files in the chosen output directory:

- `project.spec.json`
- `validation.json`
- `manifest.json`
- `wechat-cover.png`
- `xhs-cover.png`
- `x-post.png`
- `wechat-article.html`

Return those paths to the user or send the assets directly, depending on the channel.

## Runtime note

This release bundles the local Node runtime files for `cover-edit`, including `node_modules`.

However, Playwright browser binaries may still be required on a fresh machine. If rendering fails with a browser-launch error, tell the user they may need:

```bash
cd <skill>/vendor/cover-edit
npx playwright install chromium
```

Do **not** auto-run extra installs unless the user explicitly asks.

## Notes

- This skill is the orchestration layer; rendering logic lives under `vendor/cover-edit/`.
- Prefer `--strict` for user-facing outputs.
- Validate before sending or publishing.
- When exploring style, keep the layout rules fixed and vary only one axis at a time: theme, title font, or content theme.
