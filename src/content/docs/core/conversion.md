---
title: Convert with the Core API
description: Generate CSS, SCSS, Tailwind CSS v4, SwiftUI, a Figma script, Android resource XML, and serialized token documents.
section: Core API
order: 4
---

# Convert with the Core API

The Core API can generate:

- CSS custom properties;
- SCSS variables;
- Tailwind CSS v4 theme output;
- SwiftUI source;
- a Figma script;
- Android resource XML;
- DTCG JSON;
- HRDT YAML;
- DESIGN.md.

## CSS custom properties

Use `CssTokenConverter`.

```ts
import { CssTokenConverter } from "@design-token-kit/core";

const css = await new CssTokenConverter().convert([
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
const css = new CssTokenConverter().convertList(list);
```

## SCSS variables

Use `ScssTokenConverter`.

```ts
import { ScssTokenConverter } from "@design-token-kit/core";

const scss = await new ScssTokenConverter().convert([
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
const outputs = await new ScssTokenConverter().convertThemes([
  "./tokens.json",
  "./tokens.dark.json",
]);
```

This returns one stylesheet for the base source and one for each theme.

## Tailwind CSS v4

Use `TailwindTokenConverter`.

```ts
import { TailwindTokenConverter } from "@design-token-kit/core";

const css = await new TailwindTokenConverter().convert([
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
const css = await new TailwindTokenConverter({
  baseSelector: ":host",
  themeSelector: ":host([data-theme='{theme}'])",
}).convert([
  "./tokens.json",
  "./tokens.dark.json",
]);
```

## Generate SwiftUI source

Use `SwiftUiTokenConverter`.

```ts
import { SwiftUiTokenConverter } from "@design-token-kit/core";

const swift = new SwiftUiTokenConverter().convertList(list);
```

The default output is a nested enum API with typed `static let` members.
Token references are preserved as Swift constant paths.

Use `swiftType: "struct"` to add a `Theme` struct layer on top of the enum
API:

```ts
import { SwiftUiTokenConverter } from "@design-token-kit/core";

const swift = new SwiftUiTokenConverter({ swiftType: "struct" })
  .convertList(list);
```

## Generate a Figma script

Use `FigmaScriptTokenConverter`.

```ts
import { FigmaScriptTokenConverter } from "@design-token-kit/core";

const script = new FigmaScriptTokenConverter().convertList(list);
```

The generated script builds the token set inside Figma through the Plugin API, which runs only in the editor. It creates one variable collection per token layer, one mode per theme, and the variables and styles the tokens describe. References become Figma variable aliases rather than copied values.

Figma represents five of the thirteen DTCG types: `color`, `dimension`, `number`, `typography`, and `shadow`.

## Generate Android resource XML

Use `AndroidTokenConverter`.

Android output spans several resource files, so `convertResourceList()` returns one output per file, each carrying its path relative to the resource root:

```ts
import { AndroidTokenConverter } from "@design-token-kit/core";

const outputs = new AndroidTokenConverter().convertResourceList(list);

for (const output of outputs) {
  // output.filePath - "values/semantic.xml", "values-night/semantic.xml", ...
  // output.content  - resource file content
}
```

Token values are converted to their Android equivalents:

- colors to the `#AARRGGBB` hex form, alpha first;
- sizes to `dp`, font sizes to `sp`;
- `rem` resolved against a pixel base, since Android has no such unit;
- references preserved as native `@color/...` and `@dimen/...` references;
- composite tokens decomposed into one resource per field.

By default resources are split into one file per root token group, mirroring the token hierarchy. Use the `type` layout to split by Android resource type instead, and `remBase` to change the pixel base resolving `rem`:

```ts
const outputs = new AndroidTokenConverter({ layout: "type", remBase: 10 })
  .convertResourceList(list);
```

`convertDocument()` and `convertList()` return a single string and therefore only accept input producing exactly one resource file.

Older `Dtcg*` converter names are still exported as compatibility aliases, but
new code should use `CssTokenConverter`, `ScssTokenConverter`,
`TailwindTokenConverter`, `SwiftUiTokenConverter`,
`FigmaScriptTokenConverter`, and `AndroidTokenConverter`.

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
