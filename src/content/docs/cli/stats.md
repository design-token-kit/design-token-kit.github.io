---
title: Generate token statistics
description: Inspect token counts and breakdowns in text or HTML format.
section: CLI
order: 4
---

# Generate token statistics

Use `dtokens stats` to inspect a token system.

```bash
dtokens stats tokens.json
```

Without `--out`, the command writes a text report to stdout.

## Supported sources

Token statistics work with:

- DTCG JSON;
- HRDT YAML;
- DESIGN.md.

## Text output

```bash
dtokens stats tokens.yaml
```

This is useful for terminals, scripts, and CI logs.

## HTML output

Use `--out` to generate an HTML report:

```bash
dtokens stats tokens.yaml --out ./stats.html
```

Open it immediately:

```bash
dtokens stats tokens.yaml \
  --out ./stats.html \
  --open
```

## Standard input

```bash
cat tokens.yaml | dtokens stats -
```

You can also omit the source argument:

```bash
cat tokens.yaml | dtokens stats
```

## Options

- `-o, --out <file>` — generate an HTML report;
- `--open` — open the generated HTML file in the default browser.

## Package script example

```json
{
  "scripts": {
    "tokens:stats": "dtokens stats tokens.json --out ./stats.html"
  }
}
```

## Related pages

- [Generate a showcase](/docs/cli/showcase/)
- [Core overview](/docs/core/overview/)
- [Core validation](/docs/core/validation/)
