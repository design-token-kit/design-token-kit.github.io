---
title: Convert tokens
description: Convert token documents and generate CSS, SCSS, Tailwind CSS v4, SwiftUI, Figma script, or Android resource XML output.
section: CLI
order: 2
---

# Convert tokens

Use `dtokens convert` to transform token documents or generate production outputs.

```bash
dtokens convert tokens.json
```

CSS is the default output format.

## Command

```text
dtokens convert [options] [files...]
```

## Input formats

Use `--inform` or `-i` to set the input format:

- `dtcg`
- `hrdt`
- `design-md`

Input format is detected automatically by default.

```bash
dtokens convert tokens.yaml --inform hrdt
```

## Output formats

Use `--outform` or `-f`:

- `dtcg`
- `hrdt`
- `design-md`
- `css`
- `scss`
- `tailwind-v4`
- `swiftui`
- `figma-script`
- `android`

```bash
dtokens convert tokens.json --outform hrdt
```

Use `--out` or `-o` to write the result to a file:

```bash
dtokens convert tokens.json \
  --outform hrdt \
  --out ./tokens.yaml
```

Without `--out`, regular text output is written to stdout. Formats spanning several files are the exception: multi-theme SCSS and Android write a tar archive to stdout instead.

## Convert token documents

### DTCG JSON to HRDT YAML

```bash
dtokens convert tokens.json --outform hrdt
```

### HRDT YAML to DTCG JSON

```bash
dtokens convert tokens.yaml \
  --inform hrdt \
  --outform dtcg
```

### DTCG JSON to DESIGN.md

```bash
dtokens convert tokens.json --outform design-md
```

This conversion is intentionally lossy. DESIGN.md supports a compact flat model, so unsupported DTCG token types such as `border`, `shadow`, `transition`, `gradient`, `duration`, `fontFamily`, `fontWeight`, `cubicBezier`, and `strokeStyle` are skipped.

### DESIGN.md to DTCG JSON

```bash
dtokens convert DESIGN.md \
  --inform design-md \
  --outform dtcg
```

Multiple input sources are not supported for serialized token-document output.

## Generate CSS custom properties

```bash
dtokens convert tokens.json \
  --outform css \
  --out ./tokens.css
```

The generated stylesheet contains:

- base variables under `:root`;
- theme overrides under `:root[data-theme="<theme>"]`;
- token aliases as `var(--token-name)` references.

Pass a base source followed by theme sources:

```bash
dtokens convert \
  tokens.json \
  tokens.dark.json \
  --outform css \
  --out ./tokens.css
```

## Generate SCSS

```bash
dtokens convert tokens.json \
  --outform scss \
  --out ./tokens.scss
```

Use `--separator` to replace dots in token paths:

```bash
dtokens convert tokens.json \
  --outform scss \
  --separator _
```

For multiple themes, SCSS emits separate outputs instead of one stylesheet:

```bash
dtokens convert \
  tokens.json \
  tokens.dark.json \
  --outform scss \
  --out ./tokens.scss
```

This creates `tokens.base.scss` and `tokens.dark.scss`. The output directory must already exist. Without `--out`, multi-theme SCSS writes a tar archive to stdout. With `--out ./tokens.tar`, it writes that archive to a file.

## Generate Tailwind CSS v4

```bash
dtokens convert tokens.json \
  --outform tailwind-v4 \
  --out ./tokens.tailwind.css
```

With themes:

```bash
dtokens convert \
  tokens.json \
  tokens.dark.json \
  --outform tailwind-v4 \
  --out ./tokens.tailwind.css
```

Tailwind-specific selector options:

```bash
dtokens convert \
  tokens.json \
  tokens.dark.json \
  --outform tailwind-v4 \
  --base-selector :host \
  --theme-selector ":host([data-theme='{theme}'])"
```

Default Tailwind output contains `@import 'tailwindcss';`, one `@theme` block for base values, and theme selectors for overrides. Dimension tokens map to spacing by default, but names containing `breakpoint`, `radius`, `font-size`, `line-height`, or `letter-spacing` map to the matching Tailwind namespaces. The only explicit `design-token-kit.tailwindNamespace` value currently supported is `breakpoint`.

## Generate SwiftUI

```bash
dtokens convert tokens.json \
  --outform swiftui \
  --out ./DesignTokens.swift
```

Default SwiftUI output contains nested enums with typed `static let` members.
Token references are preserved as Swift constant paths.

Use `--swift-type struct` to add a `Theme` struct layer:

```bash
dtokens convert \
  tokens.json \
  tokens.dark.json \
  --outform swiftui \
  --swift-type struct \
  --out ./DesignTokens.swift
```

With multiple sources, the first file is the base token set.
Remaining files are emitted as theme variants.

## Generate a Figma script

```bash
dtokens convert tokens.json \
  --outform figma-script \
  --out ./tokens.figma.js
```

The Figma Plugin API runs only inside the editor, so tokens cannot be written from outside. Paste the generated script into a plugin that evaluates code, such as [Scripter](https://www.figma.com/community/plugin/757836922707087381), and run it.

The script creates one variable collection per token layer, one mode per theme, and the variables and styles the tokens describe. References become Figma variable aliases rather than copied values, so the layering survives. Running the script again updates what it created instead of duplicating it.

Figma represents five of the thirteen DTCG types: `color`, `dimension`, `number`, `typography`, and `shadow`. The rest are listed in the script header and reported when the script runs.

## Generate Android resource XML

```bash
dtokens convert tokens.json \
  --outform android \
  --out ./app/src/main/res
```

Android output spans several resource files, so `--out` is treated as the resource root directory. Without `--out`, the resource tree is written to stdout as a tar archive; with `--out ./res.tar`, that archive is written to a file.

Token values are converted to their Android equivalents:

- colors to the `#AARRGGBB` hex form, alpha first;
- sizes to `dp`, font sizes to `sp`;
- `rem` resolved against a pixel base, since Android has no such unit;
- references preserved as native `@color/...` and `@dimen/...` references;
- composite tokens decomposed into one resource per field.

By default resources are split into one file per root token group, mirroring the token hierarchy:

```text
res/
  values/
    primitive.xml
    semantic.xml
    component.xml
  values-night/
    semantic.xml
```

Use `--android-layout type` to split by Android resource type instead, producing `colors.xml`, `dimens.xml`, and so on.

Use `--rem-base` to change the pixel base resolving `rem` dimensions, which defaults to `16`:

```bash
dtokens convert tokens.json \
  --outform android \
  --rem-base 10 \
  --out ./app/src/main/res
```

With multiple sources, themes are written to qualified resource directories holding the overrides only. The `dark` theme maps to `values-night`, any other theme to `values-<theme>`:

```bash
dtokens convert \
  tokens.json \
  tokens.dark.json \
  --outform android \
  --out ./app/src/main/res
```

## Read from standard input

Use `-`:

```bash
cat tokens.json | dtokens convert - --outform css
```

You can omit the source when stdin is the only input:

```bash
cat tokens.json | dtokens convert --outform css
```

## Multiple sources

Multiple sources are supported when generating:

- CSS;
- SCSS;
- Tailwind CSS v4;
- SwiftUI;
- a Figma script;
- Android resource XML.

The first source is the base token set. Remaining sources are theme overrides.

## Related pages

- [Validate tokens](../../cli/validate/)
- [Core conversion API](../../core/conversion/)
