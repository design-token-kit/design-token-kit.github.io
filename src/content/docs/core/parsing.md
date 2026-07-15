---
title: Parse and load tokens
description: Read DTCG JSON, HRDT YAML, DESIGN.md, base token sets, and themes.
section: Core API
order: 2
---

# Parse and load tokens

The Core API provides readers for individual formats and a list loader for base and theme sources.

## Readers

### DTCG JSON

Use `DtcgJsonReader` to parse a DTCG JSON string into the internal token model.

```ts
import { DtcgJsonReader } from "@design-token-kit/core";

const document = new DtcgJsonReader().parse(jsonString);
```

### HRDT YAML

Use `HrdtTokenReader` for compact HRDT YAML sources.

HRDT is normalized into the same internal DTCG model used by the rest of the library.

```ts
import { HrdtTokenReader } from "@design-token-kit/core";
```

### DESIGN.md

Use `DesignMdReader` for markdown documents with YAML frontmatter.

DESIGN.md is mapped to the internal DTCG model before validation, conversion, showcase generation, or statistics processing.

```ts
import { DesignMdReader } from "@design-token-kit/core";
```

## Load a base set and themes

Use `DtcgListLoader` when you have one or more token sources:

```ts
import { DtcgListLoader } from "@design-token-kit/core";

const list = await new DtcgListLoader().load([
  "./tokens.json",
  "./tokens.dark.json",
  "./tokens.red.yaml",
]);
```

The source order matters:

1. `tokens.json` is the base token set;
2. `tokens.dark.json` is a theme override;
3. `tokens.red.yaml` is another theme override.

The resulting `DtcgList` can be passed directly to converters.

## Source abstraction

The library supports source values such as:

- local file paths;
- URLs;
- raw content strings prefixed with `content:`;
- standard input.

This lets the same processing pipeline work in CLIs, servers, build tools, and custom applications.

## Readers and writers

Readers convert source content into the internal model.

Writers serialize a parsed token document:

- `DtcgJsonWriter`
- `HrdtTokenWriter`
- `DesignMdWriter`

Example: convert parsed DTCG JSON to HRDT YAML.

```ts
import {
  DtcgJsonReader,
  HrdtTokenWriter,
} from "@design-token-kit/core";

const document = new DtcgJsonReader().parse(jsonString);
const yaml = new HrdtTokenWriter().write(document);
```

## DESIGN.md mapping

DTCG token trees commonly use layers such as:

- `primitive`;
- `semantic`;
- `component`.

`DtcgToDesignMdMapper` maps them to the flatter DESIGN.md layout:

- `colors`;
- `typography`;
- `rounded`;
- `spacing`;
- `components`.

## Choose the appropriate API

Use a reader when:

- you already have source content as a string;
- you need direct control over parsing;
- you are converting one document.

Use `DtcgListLoader` when:

- you have file paths or source locations;
- you have base and theme sources;
- you want to pass the result to a converter.

## Related pages

- [DTCG JSON](../../formats/dtcg/)
- [HRDT YAML](../../formats/hrdt/)
- [DESIGN.md](../../formats/design-md/)
- [Core validation](../../core/validation/)
- [Core conversion](../../core/conversion/)
