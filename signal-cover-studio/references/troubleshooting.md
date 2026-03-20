# Troubleshooting

## Validation fails on text overflow or safe area
- Inspect `validation.json`
- Shorten title/subtitle first
- Switch to a less dense template if needed

## Workflow runs but the HTML/image is missing
- Check `manifest.json`
- Confirm the source path exists
- Confirm the hero asset path is valid relative to the source file

## Playwright render failure
- Run `npx playwright install chromium`
- Re-run the workflow command from the repo root

## Generated spec points to broken asset paths
- Re-run with `workflow` or `scaffold --out ...` so asset paths are rebased correctly for the output directory
