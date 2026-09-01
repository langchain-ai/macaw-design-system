# Design System icons

The package uses Phosphor for general-purpose icons. Import a server-safe leaf
module for each concept; this repository does not maintain a separate icon
catalog or compatibility tree.

Import one server-safe Phosphor leaf per concept, use the named `*Icon` export,
and size every icon explicitly. Use `regular` for outline icons and request
`fill` only when the state intentionally calls for a filled glyph. Use `bold`
only where an established direct-rendered glyph must preserve a 2px visual
weight.

```tsx
import { CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';

<MagnifyingGlassIcon aria-hidden size={16} weight="regular" />;
<CheckCircleIcon aria-hidden size={16} weight="fill" />;
```

Do not import from the Phosphor package root; leaf imports keep dependency
traversal bounded. `PaddedPhosphorIcons` and `WeightedPhosphorIcons` contain the
small set of optical adjustments used by components and are exported from
`@langchain/design-system/icons`.
