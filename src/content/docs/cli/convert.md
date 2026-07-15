---
title: Convert tokens
description: Convert token documents and generate CSS, SCSS, or Tailwind CSS v4 output.
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

```bash
dtokens convert tokens.json --outform hrdt
```

Use `--out` or `-o` to write the result to a file:

```bash
dtokens convert tokens.json \
  --outform hrdt \
  --out ./tokens.yaml
```

Without `--out`, regular text output is written to stdout. Multi-theme SCSS is the exception: it writes a tar archive to stdout.

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
- Tailwind CSS v4.

The first source is the base token set. Remaining sources are theme overrides.

## Related pages

- [Validate tokens](../../cli/validate/)
- [Core conversion API](../../core/conversion/)
