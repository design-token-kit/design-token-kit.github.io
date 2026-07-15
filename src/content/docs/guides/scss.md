---
title: SCSS output
description: Generate SCSS variables for a base token set and multiple themes.
section: Guides
order: 2
---

# SCSS output

Design Token Kit can convert token documents into SCSS variables.

## Generate one stylesheet

```bash
dtokens convert tokens.json \
  --outform scss \
  --out ./tokens.scss
```

Without `--out`, a single-source result is written to stdout:

```bash
dtokens convert tokens.json --outform scss
```

## Variable names

Token paths are flattened by replacing `.` with `-`.

```text
primitive.color.brand
→ $primitive-color-brand
```

Aliases are emitted as SCSS variable references.

## Change the separator

Use `--separator`:

```bash
dtokens convert tokens.json \
  --outform scss \
  --separator _
```

Result:

```text
primitive.color.brand
→ $primitive_color_brand
```

The default separator is `-`.

## Multiple themes

Pass the base source first and theme sources after it:

```bash
dtokens convert \
  tokens.json \
  tokens.dark.json \
  --outform scss
```

Multi-theme SCSS supports two output contracts.

### Tar archive to stdout

Omit `--out`:

```bash
dtokens convert \
  tokens.json \
  tokens.dark.json \
  --outform scss
```

The command writes a tar archive to stdout.

### Tar archive file

Use a `.tar` output path:

```bash
dtokens convert \
  tokens.json \
  tokens.dark.json \
  --outform scss \
  --out ./tokens.tar
```

The archive contains files such as:

```text
tokens.base.scss
tokens.dark.scss
```

### Separate SCSS files

Use a `.scss` output path:

```bash
dtokens convert \
  tokens.json \
  tokens.dark.json \
  --outform scss \
  --out ./tokens.scss
```

The command creates:

```text
./tokens.base.scss
./tokens.dark.scss
```

## Theme names

Theme names are derived from source file names.

Technical suffixes such as these are removed:

- `.dtcg`;
- `.hrdt`;
- `.valid`;
- `.invalid`.

Examples:

```text
showcase.dark.valid.dtcg.json
→ dark
```

```text
tokens.dark.json
→ dark
```

## Core API

Generate a single stylesheet:

```ts
import { DtcgTokenScssConverter } from "@design-token-kit/core";

const scss = await new DtcgTokenScssConverter().convert([
  "./tokens.json",
]);
```

Generate separate outputs for themes:

```ts
const outputs = await new DtcgTokenScssConverter().convertThemes([
  "./tokens.json",
  "./tokens.dark.json",
]);
```

Use:

- `convertList()` for a single-document result;
- `convertThemeList()` when a prepared list contains themes.

## Related pages

- [CLI conversion](/docs/cli/convert/)
- [Core conversion](/docs/core/conversion/)
- [Tailwind CSS v4](/docs/guides/tailwind-v4/)
