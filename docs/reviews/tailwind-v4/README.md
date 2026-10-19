# Tailwind v4 compatibility screenshots

Captured in Chromium on October 19, 2026 for PR #31.

- `compatibility-light.jpg` and `compatibility-dark.jpg` compare a compiled-CSS fixture in three isolated frames: Tailwind v3 reference (`da17924`), v2 before the fixes (`198a8fa`), and fixed v2 (`21c1658`). The consumer uses real Tailwind v3 gradient utilities. The imported component CSS is compiled from each version. Shimmer animation is paused at the same position; slider shadow values are shown on a thumb enlarged 3x. These are CSS fixtures, not LangSmith product screenshots.
- `slider-v3-*.jpg` and `slider-v4-*.jpg` show the actual Slider All Variants story, using the published Tailwind v3 Storybook as the reference and local fixed v2 Storybook for the result.
- `outlines-standard.jpg` shows the same control with compiled v3 outline-none, v4 outline-none, and v4 outline-hidden utilities in standard colors. The visible focus treatment is intentionally unchanged. The CSS annotations show the lost and restored forced-colors fallback; this screenshot does not exercise native Windows high-contrast mode.

The comparison reproduces the consumer gradient losing its endpoint colors before the fix. Fixed v2 matches the v3 gradient and neutral/brand shimmer values in both themes. These focused captures do not establish visual parity across every component or product page.
