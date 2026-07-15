---
title: Tailwind CSS v4
description: Generate Tailwind CSS v4 theme variables from DTCG, HRDT, or DESIGN.md sources.
section: Guides
order: 1
---

# Tailwind CSS v4

Design Token Kit can generate Tailwind CSS v4 theme output with `@theme`.

## CLI usage

Generate a base theme:

```bash
dtokens convert tokens.json \
  --outform tailwind-v4 \
  --out ./tokens.tailwind.css
```

Generate a base theme and overrides:

```bash
dtokens convert \
  tokens.json \
  tokens.dark.json \
  --outform tailwind-v4 \
  --out ./tokens.tailwind.css
```

Default output contains:

```css
@import "tailwindcss";

@theme {
  /* base theme variables */
}

[data-theme="dark"] {
  /* theme overrides */
}
```

## Core API

```ts
import { DtcgTailwindCssConverter } from "@design-token-kit/core";

const css = await new DtcgTailwindCssConverter().convert([
  "./tokens.json",
  "./tokens.dark.json",
]);
```

## Custom selectors

Use custom selectors for Shadow DOM or another scoped runtime:

```bash
dtokens convert \
  tokens.json \
  tokens.dark.json \
  --outform tailwind-v4 \
  --base-selector :host \
  --theme-selector ":host([data-theme='{theme}'])"
```

Core API equivalent:

```ts
const css = await new DtcgTailwindCssConverter({
  baseSelector: ":host",
  themeSelector: ":host([data-theme='{theme}'])",
}).convert([
  "./tokens.json",
  "./tokens.dark.json",
]);
```

`--base-selector` adds an explicit mirror of the base custom properties outside `@theme`. It is not required for the default output.

## Namespace mappings

The converter maps DTCG token types to Tailwind variables.

Current mappings include:

- `color` → `--color-*`;
- `fontFamily` → `--font-*`;
- `fontWeight` → `--font-weight-*`;
- `shadow` → `--shadow-*`;
- `gradient` → `--background-image-*`;
- `duration` → `--duration-*`;
- `cubicBezier` → `--ease-*`.

`typography` tokens are flattened into related Tailwind variables for font, text size, line height, letter spacing, and font weight.

`transition` tokens are flattened into duration and easing variables.

## Dimension tokens

DTCG does not define a separate breakpoint type. Tailwind namespaces for dimension tokens are resolved in this order:

1. `$extensions["design-token-kit"].tailwindNamespace`;
2. path segments such as `breakpoint`, `breakpoints`, `screen`, or `screens`;
3. fallback to `--spacing-*`.

The currently supported explicit namespace value is:

```json
{
  "$extensions": {
    "design-token-kit": {
      "tailwindNamespace": "breakpoint"
    }
  }
}
```

Depending on naming and context, dimension tokens can map to:

- `--spacing-*`;
- `--breakpoint-*`;
- `--radius-*`;
- `--text-*`;
- `--tracking-*`.

## Color behavior

The converter emits:

- opaque sRGB colors as hexadecimal values;
- translucent sRGB colors as `rgb(... / ...)`;
- other color spaces using native CSS color syntax.

## Font weights

Common keywords are converted to numeric CSS weights.

Examples:

- `regular` → `400`;
- `book` → `400`;
- `bold` → `700`.

## Limitations

Current limitations include:

- composite `border` tokens are not emitted as Tailwind theme variables;
- dimensions named like border widths are skipped instead of using an undocumented namespace;
- `transition.delay` is not emitted.

## Related pages

- [CLI conversion](/docs/cli/convert/)
- [Core conversion](/docs/core/conversion/)
- [DTCG JSON](/docs/formats/dtcg/)
