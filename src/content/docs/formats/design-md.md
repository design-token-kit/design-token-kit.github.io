---
title: DESIGN.md
description: Read and write design tokens in markdown with YAML frontmatter.
section: Formats
order: 3
---

# DESIGN.md

DESIGN.md is a markdown-based format with YAML frontmatter.

It is useful when token definitions should live beside human-readable design-system documentation.

Design Token Kit supports reading DESIGN.md, converting it to the internal DTCG model, and writing DTCG documents back to DESIGN.md.

## When to use it

Choose DESIGN.md when:

- token definitions and design guidance should live in one document;
- the document is written for people and tools;
- design context is as important as the raw token data;
- an AI agent or developer needs a readable design reference.

## Document model

The YAML frontmatter contains the machine-readable design data. Markdown content can explain how the system should be used.

The supported flat DESIGN.md layout includes sections such as:

- `colors`;
- `typography`;
- `rounded`;
- `spacing`;
- `components`.

A simplified document shape:

```md
---
colors:
  brand-primary: "#2549f6"
spacing:
  small: "8px"
---

# Design system

Use the brand color for primary actions.
```

The exact token data is normalized into the internal DTCG model before other DTK operations run.

## Validate DESIGN.md

```bash
dtokens check DESIGN.md --inform design-md
```

DESIGN.md uses its own frontmatter schema. The CLI `--schema` option is for DTCG JSON schema selection and does not change DESIGN.md validation.

Use `--inform design-md` when the file name or content shape is ambiguous.

## Convert DESIGN.md

### To DTCG JSON

```bash
dtokens convert DESIGN.md \
  --inform design-md \
  --outform dtcg
```

### From DTCG JSON

```bash
dtokens convert tokens.json \
  --outform design-md \
  --out DESIGN.md
```

## Generate outputs

```bash
dtokens convert DESIGN.md \
  --inform design-md \
  --outform css \
  --out ./tokens.css
```

```bash
dtokens showcase DESIGN.md --out ./showcase.html
```

```bash
dtokens stats DESIGN.md --out ./stats.html
```

## Core APIs

Use:

- `DesignMdReader` to parse DESIGN.md;
- `DesignMdWriter` to write DESIGN.md;
- `DtcgToDesignMdMapper` to flatten DTCG token trees into the DESIGN.md layout.

Common DTCG layers such as `primitive`, `semantic`, and `component` are mapped to the flatter DESIGN.md structure. The mapping is lossy for token types that DESIGN.md does not model directly.

## Related pages

- [DTCG JSON](../../formats/dtcg/)
- [HRDT YAML](../../formats/hrdt/)
- [Core parsing](../../core/parsing/)
- [CLI conversion](../../cli/convert/)
