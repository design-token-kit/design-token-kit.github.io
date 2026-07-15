---
title: Validate tokens
description: Check token documents with schema, model, and lint rules from the command line.
section: CLI
order: 1
---

# Validate tokens

Use `dtokens check` to validate DTCG JSON, HRDT YAML, and DESIGN.md token documents.

```bash
dtokens check tokens.json
```

`validate` is an alias for `check`:

```bash
dtokens validate tokens.json
```

## Check pipeline

The command uses a fail-fast pipeline:

1. Load and parse the source.
2. Validate its structure or schema.
3. Check the resolved token model.
4. Run lint rules when the selected scope includes linting.

A document must pass an earlier stage before the next stage runs.

## Scopes

Select the depth of the pipeline with `--scope`.

### Schema

Loads the source and checks its structure against the selected schema.

```bash
dtokens check tokens.json --scope schema
```

### Validate

Runs schema checks and model-correctness checks.

```bash
dtokens check tokens.json --scope validate
```

This is the default scope.

### Lint

Runs schema checks, model checks, and lint rules.

```bash
dtokens check tokens.json --scope lint
```

## Model checks

The validation pipeline detects problems such as:

- unresolved token references;
- circular references;
- references to groups instead of tokens;
- declared and resolved type mismatches;
- duplicate gradient stops;
- deprecated token usage.

## Lint checks

The lint scope includes rules for:

- root layer names;
- references between token layers;
- raw values placed above the lowest layer;
- empty groups;
- missing token descriptions.

The default layer order is:

```text
primitive,semantic,component
```

Override it with `--layers`:

```bash
dtokens check tokens.json \
  --scope lint \
  --layers primitive,semantic,component
```

## Run selected checks

Use `--checks` with a comma-separated allow-list:

```bash
dtokens check tokens.json \
  --scope lint \
  --checks layer-reference,raw-value-usage
```

Run the help command to see the available check IDs, scopes, severities, and descriptions:

```bash
dtokens check --help
```

## Select a schema

Use the built-in DTCG 2025.10 schema:

```bash
dtokens check tokens.json --schema 2025.10
```

Use the extended DESIGN.md-compatible schema:

```bash
dtokens check tokens.json --schema 2025.10-design.md
```

You can also pass a schema directory path with `--schema`.

## Select an input format

Input format is detected automatically by default.

Set it explicitly with `--inform`:

```bash
dtokens check tokens.yaml --inform hrdt
dtokens check DESIGN.md --inform design-md
dtokens check tokens.json --inform dtcg
```

Supported values:

- `dtcg`
- `hrdt`
- `design-md`

## Check multiple sources

The first source is treated as the base token set. Additional sources are treated as theme overrides.

```bash
dtokens check tokens.json tokens.dark.json
```

You can mix file input and standard input:

```bash
dtokens check - tokens.dark.yaml < tokens.yaml
```

## Read from standard input

Pass `-`:

```bash
cat tokens.json | dtokens check -
```

You can also omit source arguments:

```bash
cat tokens.json | dtokens check
```

## Exit status

The command uses these exit codes:

- `0` — success;
- `1` — unexpected error;
- `2` — issues found.

This makes `check` suitable for CI pipelines and package scripts.

```json
{
  "scripts": {
    "tokens:check": "dtokens check tokens.json --scope lint"
  }
}
```

## Related pages

- [Getting started](/docs/getting-started/)
- [DTCG JSON](/docs/formats/dtcg/)
- [HRDT YAML](/docs/formats/hrdt/)
- [DESIGN.md](/docs/formats/design-md/)
- [Core validation API](/docs/core/validation/)
