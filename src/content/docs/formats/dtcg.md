---
title: DTCG JSON
description: Use the Design Tokens Community Group JSON format as the canonical DTK source.
section: Formats
order: 1
---

# DTCG JSON

DTCG JSON is the canonical token format supported by Design Token Kit.

It follows the Design Tokens Community Group specification and uses the DTCG 2025.10 schema.

## When to use it

Choose DTCG JSON when:

- you need a standards-based token source;
- another tool already produces DTCG documents;
- explicit token types are important;
- the document will be processed mainly by tools and automation.

## Basic structure

DTCG tokens use `$value` and can declare `$type`.

A small layered example:

```json
{
  "primitive": {
    "spacing": {
      "small": {
        "$type": "dimension",
        "$value": {
          "value": 8,
          "unit": "px"
        }
      }
    }
  },
  "semantic": {
    "spacing": {
      "control-gap": {
        "$type": "dimension",
        "$value": "{primitive.spacing.small}"
      }
    }
  }
}
```

References use token paths inside braces:

```text
{primitive.spacing.small}
```

## Recommended layers

Design Token Kit lint rules support an ordered layer model.

The default order is:

```text
primitive → semantic → component
```

Typical responsibilities:

- **primitive** — raw palette, size, duration, and typography values;
- **semantic** — design roles such as action, surface, or content;
- **component** — values for a specific component and state.

You can customize the layer order in the CLI with `--layers`.

## Validate DTCG JSON

```bash
dtokens check tokens.json
```

Run the complete pipeline:

```bash
dtokens check tokens.json --scope lint
```

Use the built-in schema explicitly:

```bash
dtokens check tokens.json --schema 2025.10
```

## Convert DTCG JSON

```bash
dtokens convert tokens.json --outform hrdt
dtokens convert tokens.json --outform design-md
dtokens convert tokens.json --outform css
dtokens convert tokens.json --outform scss
dtokens convert tokens.json --outform tailwind-v4
```

## Themes

Pass the base source first and theme overrides after it:

```bash
dtokens convert \
  tokens.json \
  tokens.dark.json \
  --out ./tokens.css
```

## Core APIs

Use:

- `DtcgJsonReader` to parse JSON content;
- `DtcgJsonWriter` to serialize a document;
- `DtcgSchemaValidator` for schema-only validation;
- `DtcgChecker` for the complete check pipeline.

## Related pages

- [HRDT YAML](../../formats/hrdt/)
- [DESIGN.md](../../formats/design-md/)
- [Validate tokens](../../cli/validate/)
- [Parse and load tokens](../../core/parsing/)
