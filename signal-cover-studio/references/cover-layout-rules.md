# Cover Layout Rules

Use this file when the user asks for a cross-platform cover bundle, editorial text cover, Xiaohongshu cover + WeChat cover + X image set, or when iterating on layout quality instead of just generating a generic poster.

## Generator Choice

Use `../../projects/cover-edit` for this mode.

Do **not** default to the old pure-black Bauhaus poster when the user is clearly asking for a cleaner editorial bundle across multiple platforms.

Use the Bauhaus fallback only when the user explicitly wants that black-poster mood or a single-message text poster.

## Stable Visual Direction

Use a clean editorial cover, not a decorative template.

Keep these non-negotiables:

- no comic bubbles
- no badges
- no black-green dirty effects
- no extra decorative clutter
- no four-corner occupancy
- no fake balance made by sprinkling content everywhere
- if the image feels busy, remove elements instead of adding more

## Core Composition Rule

Build the cover as **two visual poles**, not four corners:

1. **Upper-left main block**
   - eyebrow / small label
   - main title
   - subtitle / secondary sentence
2. **Lower-right secondary block**
   - summary / support text only

Leave the other two corners mostly empty.

The user explicitly rejected layouts where all four corners carry content because they feel too average and lose beauty.

## Balance Rule

Aim for asymmetrical balance, not symmetry-by-distribution.

That means:

- do not place small labels in both top-right and bottom-left just to “balance” the page
- do not mirror everything mechanically
- use one dominant text mass on the left and one lighter counterweight on the lower-right
- keep the right-side block clearly secondary

## Alignment Rule

- Keep the **title and subtitle left-aligned** in the same main block.
- Keep the **summary right-aligned** in the lower-right block.
- Match the **right outer margin** to the **left outer margin**.
- When pushing the lower-right block rightward, move the whole block toward the edge instead of narrowing the box until it clips.

## Spacing Rule

Use deliberate density:

- keep the title large
- keep the subtitle closer to the title than a generic template would
- treat title + subtitle as one visual family
- keep more air between the left main block and the lower-right summary block than inside the main block itself

The user specifically preferred tighter title/subtitle spacing because density is part of the composition.

## Typography Rule

- Main title should be aggressive and large.
- Subtitle should also be visibly large, not tiny helper text.
- For **XHS** and **X**, the upper-left eyebrow label should be much larger than a normal micro-label; roughly “about twice as large” as the earlier timid version.
- For **WeChat cover**, the title should be slightly larger than the equivalent default cross-platform setting.
- Hard-fail any clipping, overflow, or safe-area violation.

## Decoration Rule

Minimal means minimal:

- remove the old upper-left horizontal lines unless the user explicitly asks them back
- remove the lower-right dot matrix unless the user explicitly asks it back
- do not reintroduce ornamental shapes just to fill space

## Practical Workflow

1. Use `../../projects/cover-edit`.
2. Keep the current accepted layout logic in `src/lib/render-model.js` as the source of truth.
3. Validate before sending images.
4. Render all requested targets together when possible.
5. Send real image files, not file paths.

## What “good” means for this user

A good result should feel:

- clean
- editorial
- weighted
- not average
- not overly symmetrical
- not decorative for decoration’s sake
- like one strong left-side statement with one controlled lower-right counterweight
