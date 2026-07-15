---
title: Convert with the Core API
description: Generate CSS, SCSS, Tailwind CSS v4, and serialized token documents.
section: Core API
order: 4
---

# Convert with the Core API

The Core API can generate:

- CSS custom properties;
- SCSS variables;
- Tailwind CSS v4 theme output;
- DTCG JSON;
- HRDT YAML;
- DESIGN.md.

## CSS custom properties

Use `DtcgTokenCssConverter`.

```ts
import { DtcgTokenCssConverter } from "@design-token-kit/core";

const css = await new DtcgTokenCssConverter().convert([
  "./tokens.json",
  "./tokens.dark.json",
]);
```

The converter emits:

- base tokens under `:root`;
- theme overrides under `:root[data-theme="<theme>"]`;
- aliases as CSS `var(...)` references.

When a parsed document or `DtcgList` is already available, use:

- `convertDocument()`;
- `convertList()`.

```ts
const css = new DtcgTokenCssConverter().convertList(list);
```

## SCSS variables

Use `DtcgTokenScssConverter`.

```ts
import { DtcgTokenScssConverter } from "@design-token-kit/core";

const scss = await new DtcgTokenScssConverter().convert([
  "./tokens.json",
]);
```

Token paths are flattened into variable names:

```text
primitive.color.brand
→ $primitive-color-brand
```

Aliases are emitted as SCSS variable references.

For multiple themes, use `convertThemes()`:

```ts
const outputs = await new DtcgTokenScssConverter().convertThemes([
  "./tokens.json",
  "./tokens.dark.json",
]);
```

This returns one stylesheet for the base source and one for each theme.

## Tailwind CSS v4

Use `DtcgTailwindCssConverter`.

```ts
import { DtcgTailwindCssConverter } from "@design-token-kit/core";

const css = await new DtcgTailwindCssConverter().convert([
  "./tokens.json",
  "./tokens.dark.json",
]);
```

Default output contains:

- `@import 'tailwindcss';`;
- one `@theme` block for base values;
- theme selectors for overrides.

Dimension tokens map to spacing by default. Names containing `breakpoint`, `radius`, `font-size`, `line-height`, or `letter-spacing` map to the matching Tailwind namespaces. The only explicit `design-token-kit.tailwindNamespace` value currently supported is `breakpoint`.

Configure selectors when the output is used in Shadow DOM or another scoped environment:

```ts
const css = await new DtcgTailwindCssConverter({
  baseSelector: ":host",
  themeSelector: ":host([data-theme='{theme}'])",
}).convert([
  "./tokens.json",
  "./tokens.dark.json",
]);
```

## Convert token documents

Use readers and writers to convert serialized token formats.

```ts
import {
  DtcgJsonReader,
  HrdtTokenWriter,
} from "@design-token-kit/core";

const document = new DtcgJsonReader().parse(jsonString);
const yaml = new HrdtTokenWriter().write(document);
```

Available writers:

- `DtcgJsonWriter`;
- `HrdtTokenWriter`;
- `DesignMdWriter`.

Use `DtcgToDesignMdMapper` when mapping a DTCG tree to the flat DESIGN.md model. This mapping is intentionally lossy: unsupported DTCG token types such as `border`, `shadow`, `transition`, `gradient`, `duration`, `fontFamily`, `fontWeight`, `cubicBezier`, and `strokeStyle` are skipped.

## Generate a showcase

```ts
import { createTokenHtmlShowcase } from "@design-token-kit/core";

const html = await createTokenHtmlShowcase().showcase([
  "./tokens.yaml",
]);
```

The showcase pipeline accepts token sources and existing CSS.

Existing CSS is rendered directly only when it is the single source.

## Generate statistics

```ts
import { createTokenStats } from "@design-token-kit/core";

const stats = await createTokenStats().stats([
  "./tokens.yaml",
]);
```

## Related pages

- [Parse and load tokens](../../core/parsing/)
- [Core validation](../../core/validation/)
- [CLI conversion](../../cli/convert/)
