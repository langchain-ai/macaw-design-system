## 1.0.0 (2026-10-19)

- Graduate the components, tokens, and CLI packages from beta to stable `1.0.0`, published to npm `latest`.
- Require Tailwind v4, React 19, and Node 26 or newer; update consumer CSS configuration accordingly.
- Preserve component appearance through the Tailwind migration, including outlines, gradients, shadows, typography, and Storybook layouts.

- Add labeled vertical event markers to LineChart, including band-scale alignment and clipped plot bounds.
- Add muted badge suffixes with an accessible separator.
- Use the subtle border consistently for secondary buttons in dark mode.
- Correct the orientation of Engine logo and badge marks.

## 1.0.0-beta.9 (2026-10-16)

### 🚀 Features

- add toolbar and diff to CodeLite [FEP-569] ([#43](https://github.com/langchain-ai/langchain-design-system/pull/43))

### 🩹 Fixes

- modify config path ([#44](https://github.com/langchain-ai/langchain-design-system/pull/44))

### ❤️ Thank You

- Jeeyoon Hyun

## 1.0.0-beta.8 (2026-10-15)

### 🚀 Features

- add heatmap charts and compact loading and attachment states ([#40](https://github.com/langchain-ai/langchain-design-system/pull/40))

### ❤️ Thank You

- Nick

## 1.0.0-beta.7 (2026-10-15)

This was a version bump only, there were no code changes.

## 1.0.0-beta.6 (2026-10-15)

### 🩹 Fixes

- Try Pinning PNPM version ([#39](https://github.com/langchain-ai/langchain-design-system/pull/39))

### ❤️ Thank You

- Ian SooHoo

## 1.0.0-beta.5 (2026-10-14)

### 🩹 Fixes

- version verify-package ([#38](https://github.com/langchain-ai/langchain-design-system/pull/38))

### ❤️ Thank You

- Ian SooHoo

## 1.0.0-beta.4 (2026-10-14)

### 🩹 Fixes

- preserve Typeahead, CodeLite, and GroupedTabs behavior ([#36](https://github.com/langchain-ai/langchain-design-system/pull/36))

### ❤️ Thank You

- Nick

## 1.0.0-beta.3 (2026-10-14)

### 🚀 Features

- sync LangChainPlus design system through September 29 ([#21](https://github.com/langchain-ai/langchain-design-system/pull/21))
- sync non-Chat design system updates for 1.1.0-beta.0 ([#28](https://github.com/langchain-ai/langchain-design-system/pull/28))
- add component parity fixes ([#32](https://github.com/langchain-ai/langchain-design-system/pull/32))
- Add Release App Token ([#35](https://github.com/langchain-ai/langchain-design-system/pull/35))

### 🩹 Fixes

- **ci:** allow Storybook preview comments on pull requests ([#24](https://github.com/langchain-ai/langchain-design-system/pull/24))
- **deps:** remediate axios and brace-expansion advisories ([#26](https://github.com/langchain-ai/langchain-design-system/pull/26))

### ❤️ Thank You

- Ian SooHoo
- John Kennedy @jkennedyvz
- Nick @nick-kim-langchain

## 1.0.0-beta.2 (2026-10-12)

### 🚀 Features

- migrate builds ([9416432](https://github.com/langchain-ai/langchain-design-system/commit/9416432))
- migrate build scripts ([efbfa26](https://github.com/langchain-ai/langchain-design-system/commit/efbfa26))
- ci ([9609980](https://github.com/langchain-ai/langchain-design-system/commit/9609980))
- update ci ([0ce35e9](https://github.com/langchain-ai/langchain-design-system/commit/0ce35e9))

### 🩹 Fixes

- package.json ([00ef215](https://github.com/langchain-ai/langchain-design-system/commit/00ef215))
- public ([57dde65](https://github.com/langchain-ai/langchain-design-system/commit/57dde65))

### ❤️ Thank You

- Ian SooHoo

## 1.1.0-beta.0 (2026-10-01)

### 🚀 Features

- Add composable Code toolbars, a language picker with alias support, optional folding controls, and editor update callbacks.
- Add SankeyChart, Attachment/AttachmentList, and the September input, chart, sizing, and split-pane improvements ([#21](https://github.com/langchain-ai/macaw-design-system/pull/21)).

### 🩹 Fixes

- Reset Toast dismissal timers for each notification without remounting application content, and align toast typography and spacing.
- **ci:** allow Storybook preview comments on pull requests ([#24](https://github.com/langchain-ai/macaw-design-system/pull/24))
- **deps:** remediate axios and brace-expansion advisories ([#26](https://github.com/langchain-ai/macaw-design-system/pull/26))

Chat components and their supporting changes remain excluded from this release.

### ❤️ Thank You

- John Kennedy @jkennedyvz
- Nick

## 1.0.0-beta.1 (2026-09-23)

### 🩹 Fixes

- prevent chart date and time formatting crashes ([#15](https://github.com/langchain-ai/macaw-design-system/pull/15))

### ❤️ Thank You

- Nick
