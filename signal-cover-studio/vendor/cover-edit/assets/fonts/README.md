# Local font strategy

`cover-edit` no longer loads any remote web fonts.

## Runtime strategy

The app uses only local/system font stacks declared in `src/lib/font-profile.js`:

- `editorialSerifCn`: prefers Noto / Source Han / Songti serif families
- `editorialSansCn`: prefers Noto / Source Han / PingFang / Hiragino sans families
- `uiSans`: prefers Inter / Noto Sans / system-ui

## CI strategy

Install `fonts-noto-cjk` in CI so Linux runners have deterministic Chinese glyph coverage.

## Optional vendoring

If you want stricter reproducibility later, place vendored font files here and wire them into `@font-face`.
