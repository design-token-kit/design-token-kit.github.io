---
title: Getting started
description: Install Design Token Kit, check your first token file, and generate an output.
section: Introduction
order: 1
---

# Getting started

Design Token Kit helps you check, convert, preview, and analyze design tokens.

You can use it in two ways:

- **CLI** for local scripts, package scripts, and CI.
- **Core API** for applications, integrations, and custom tooling.

Design Token Kit requires **Node.js 18 or newer**.

## Choose how to use DTK

### CLI

Install the command-line package:

```bash
npm install --save-dev @design-token-kit/cli
```

Run it with `npx`:

```bash
npx @design-token-kit/cli check tokens.json
```

You can also install the package globally:

```bash
npm install -g @design-token-kit/cli
dtokens check tokens.json
```

### Core API

Install the library:

```bash
npm install @design-token-kit/core
```

Import the APIs you need:

```ts
import {
  DtcgChecker,
  DtcgListLoader,
  DtcgTokenCssConverter,
} from "@design-token-kit/core";
```

## Check your first token file

Use `check` to run schema and model validation:

```bash
npx @design-token-kit/cli check tokens.json
```

Use the `lint` scope to run the full check pipeline:

```bash
npx @design-token-kit/cli check tokens.json --scope lint
```

The `validate` command is an alias for `check`:

```bash
npx @design-token-kit/cli validate tokens.json
```

Learn more in [CLI validation](../cli/validate/).

## Generate CSS

Convert a token document to CSS custom properties:

```bash
npx @design-token-kit/cli convert tokens.json --out ./tokens.css
```

The base token set is emitted under `:root`. Theme overrides are emitted under selectors such as:

```css
:root[data-theme="dark"] {
  /* theme overrides */
}
```

Learn more in [CLI conversion](../cli/convert/).

## Generate other outputs

### SCSS

```bash
npx @design-token-kit/cli convert tokens.json \
  --outform scss \
  --out ./tokens.scss
```

### Tailwind CSS v4

```bash
npx @design-token-kit/cli convert tokens.json \
  --outform tailwind-v4 \
  --out ./tokens.tailwind.css
```

### Static showcase

```bash
npx @design-token-kit/cli showcase tokens.json \
  --out ./showcase.html \
  --open
```

### Statistics report

```bash
npx @design-token-kit/cli stats tokens.json \
  --out ./stats.html \
  --open
```

## Supported inputs

Design Token Kit accepts:

- [DTCG JSON](../formats/dtcg/)
- [HRDT YAML](../formats/hrdt/)
- [DESIGN.md](../formats/design-md/)
- local files
- URLs
- raw token content with the `content:` prefix
- standard input

Use `-` or omit source arguments to read from standard input:

```bash
cat tokens.json | npx @design-token-kit/cli check -
```

## Base tokens and themes

When you pass multiple token sources, the first source is the base token set. The remaining sources are theme overrides.

```bash
npx @design-token-kit/cli convert \
  tokens.json \
  tokens.dark.json \
  --out ./tokens.css
```

Multiple sources are supported for CSS and Tailwind CSS v4 output. SCSS supports multiple themes, but emits separate files or a tar archive.

## Next steps

- [Validate token files](../cli/validate/)
- [Convert token files](../cli/convert/)
- [Use the Core API](../core/overview/)
- [Use supported formats](../formats/dtcg/)
