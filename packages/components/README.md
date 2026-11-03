# Macaw components

React components, styles, icons, and usage guidance for the Macaw Design System.
Requires React 19 and Node 26 or newer. Includes `@langchain/macaw-tokens` as a dependency.

```sh
pnpm add @langchain/macaw-components@1.0.0
```

```tsx
import '@langchain/macaw-components/styles.css';
import { Button, Card, Text } from '@langchain/macaw-components';
import { Code } from '@langchain/macaw-components/Code';
import { AppThemeProvider } from '@langchain/macaw-components/hooks/AppThemeProvider';
```

Wrap your application in `AppThemeProvider`. Import the stylesheet once; it
includes fonts, theme tokens, base styles, and compiled component utilities.
Use the `dark` class on `html` to select the dark theme.

The root export contains common components. Use direct family exports such as
`/Button`, `/BarChart`, `/Code`, and `/Tabs` for explicit dependency boundaries.
Hooks, utilities, and icons have `/hooks/*`, `/utils/*`, and `/icons` entry points.
The optional Tailwind v4 integration is available at `/tailwind-preset`.

Read [DESIGN.md](docs/DESIGN.md) and [STYLES.md](docs/STYLES.md). The `/catalog.json`
export describes this package version for `@langchain/macaw-cli`.
