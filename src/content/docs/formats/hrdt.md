---
title: HRDT YAML
description: Author design tokens in a compact, human-readable YAML format.
section: Formats
order: 2
---

# HRDT YAML

HRDT means **Human-Readable Design Tokens**.

It is a compact YAML-based authoring format designed to be easier to read and write than raw DTCG JSON.

Design Token Kit parses HRDT into the same internal DTCG model used by validation, conversion, showcase, and statistics APIs.

## When to use it

Choose HRDT YAML when:

- people edit token files directly;
- you want a compact source format;
- you want to keep the same DTK validation and conversion pipeline;
- JSON syntax makes the source unnecessarily verbose.

## Example

A compact layered source can look like this:

```yaml
primitive.color.white: "#ffffff"
primitive.color.brand-500: "#2549f6"

semantic.color.action-primary: "{primitive.color.brand-500}"

component.button.primary.background: "{semantic.color.action-primary}"
```

HRDT keeps token paths and references visible while reducing structural noise.

## Validate HRDT

Input format is normally detected automatically:

```bash
dtokens check tokens.yaml
```

Set it explicitly when needed:

```bash
dtokens check tokens.yaml --inform hrdt
```

Run lint checks:

```bash
dtokens check tokens.yaml \
  --inform hrdt \
  --scope lint
```

## Convert HRDT

### To DTCG JSON

```bash
dtokens convert tokens.yaml \
  --inform hrdt \
  --outform dtcg
```

### To CSS

```bash
dtokens convert tokens.yaml \
  --inform hrdt \
  --outform css \
  --out ./tokens.css
```

### To SCSS

```bash
dtokens convert tokens.yaml \
  --inform hrdt \
  --outform scss \
  --out ./tokens.scss
```

### To Tailwind CSS v4

```bash
dtokens convert tokens.yaml \
  --inform hrdt \
  --outform tailwind-v4 \
  --out ./tokens.tailwind.css
```

## Generate reports

```bash
dtokens showcase tokens.yaml --out ./showcase.html
dtokens stats tokens.yaml --out ./stats.html
```

## Core APIs

Use:

- `HrdtTokenReader` to read HRDT content;
- `HrdtTokenWriter` to serialize a token document as HRDT;
- `HrdtTokenValidator` for format validation;
- `DtcgListLoader` to load HRDT together with base or theme sources.

## Related pages

- [DTCG JSON](/docs/formats/dtcg/)
- [DESIGN.md](/docs/formats/design-md/)
- [CLI conversion](/docs/cli/convert/)
- [Core parsing](/docs/core/parsing/)
