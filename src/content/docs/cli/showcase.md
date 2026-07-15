---
title: Generate a showcase
description: Create a static HTML preview from token documents or existing CSS.
section: CLI
order: 3
---

# Generate a showcase

Use `dtokens showcase` to generate a static HTML preview of your design tokens.

```bash
dtokens showcase tokens.json --out ./showcase.html
```

## Supported sources

The showcase command accepts:

- DTCG JSON;
- HRDT YAML;
- DESIGN.md;
- existing CSS.

CSS input can contain:

- classic `:root` custom properties;
- Tailwind CSS v4 `@theme` variables;
- theme override selectors.

## Generate from tokens

### DTCG JSON

```bash
dtokens showcase tokens.json --out ./showcase.html
```

### HRDT YAML

```bash
dtokens showcase tokens.yaml --out ./showcase.html
```

### DESIGN.md

```bash
dtokens showcase DESIGN.md --out ./showcase.html
```

## Generate from CSS

```bash
dtokens showcase tokens.css --out ./showcase.html
```

A single CSS source can be rendered directly without passing through token validation.

## Open the result

Use `--open` together with `--out`:

```bash
dtokens showcase tokens.json \
  --out ./showcase.html \
  --open
```

`--open` requires an output file because the browser needs a generated HTML document to open.

## Read from standard input

```bash
cat tokens.yaml | dtokens showcase - --out ./showcase.html
```

## Options

- `-o, --out <file>` — output HTML file name or path;
- `--open` — open the generated file in the default browser.

## Typical package script

```json
{
  "scripts": {
    "tokens:showcase": "dtokens showcase tokens.json --out ./showcase.html"
  }
}
```

## Related pages

- [Token statistics](/docs/cli/stats/)
- [Core overview](/docs/core/overview/)
- [DTCG JSON](/docs/formats/dtcg/)
