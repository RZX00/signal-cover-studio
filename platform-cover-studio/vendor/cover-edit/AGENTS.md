# Repository Guidelines

## Project Structure & Module Organization
- `cover.html` contains all markup, styling, and JavaScript for the cover editor; there are no external build artifacts.
- Inline CSS defines the layout, palette variables, and responsive rules; keep gradients and radii configurable via existing custom properties.
- Inline script handles preset sizing, preview updates, gradient utilities, and export functions (JPEG/PNG/SVG). Keep new logic in small helpers near related functionality.
- Fonts load from Google Fonts (`Inter`, `Playfair Display`); avoid adding heavyweight libraries unless justified.

## Build, Test, and Development Commands
- Run locally by opening `cover.html` in a modern browser, or serve from the project root: `python -m http.server 8000`.
- For quick iteration, keep DevTools open and throttle to test slow font loads; the page is single-file, so no build step is required.

## Coding Style & Naming Conventions
- Use 2-space indentation, no tabs. Prefer single quotes in JS and double quotes in HTML attributes to match existing code.
- Follow existing ID/class patterns (`camelCase` for JS refs like `widthInput`, `kebab-case` for CSS classes).
- Keep CSS within the `<style>` block and JS within the `<script>` block; avoid splitting into external assets unless you also update references.
- Add concise comments only for non-obvious logic (e.g., export error handling or canvas fallbacks).

## Testing Guidelines
- Manual checks: verify preset buttons update dimensions, gradient controls reflect in the preview, and resize events keep the preview scaled.
- Export checks: test `下载 JPG`, `导出 SVG`, and `下载 PNG` at multiple sizes; confirm files download and render without clipped text.
- Browser coverage: test in Chromium-based browsers and one WebKit engine (Safari) when possible; ensure fonts load or fallback stacks look acceptable.

## Commit & Pull Request Guidelines
- Use imperative, descriptive commit messages (e.g., `Improve SVG export timeout`, `Adjust default gradient set`).
- PRs should include: a clear summary of changes, manual test notes (commands and browsers used), and screenshots of before/after for visual tweaks.
- Link any related issues; call out regressions risks (export, scaling, or preset behaviors) and how they were mitigated.

## Export & Performance Notes
- Keep export paths efficient: reuse existing canvas/SVG helpers and avoid adding large dependencies to maintain fast in-browser rendering.
- When changing fonts or gradients, ensure defaults remain light and readable; verify `scaleSelect` options still produce expected output dimensions.
