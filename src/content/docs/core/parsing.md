---
title: Parse and load tokens
description: Read DTCG JSON, HRDT YAML, DESIGN.md, base token sets, and themes.
section: Core API
order: 3
---

# Parse and load tokens

The Core API provides readers for individual formats and a list loader for base and theme sources.

## Readers

A reader validates its own format and returns a result instead of throwing.

The result is a tagged union: `ok` says whether the source was read, `documents` is available only on the successful branch, and `issues` explains a failure. A source with errors yields no document at all, so the compiler will not let you reach for `documents` until you have checked `ok`.

### DTCG JSON

Use `DtcgReader` to read a DTCG JSON string into the internal token model.

```ts
import { DtcgReader } from "@design-token-kit/core";

const reader = await DtcgReader.create();
const result = reader.read(jsonString);

if (!result.ok) {
  console.error(result.issues);
  process.exit(1);
}

const document = result.documents[0];
```

`DtcgReader.create()` loads the DTCG JSON Schema from disk once, so reading a document afterwards is synchronous. It also accepts a built-in schema name or a path to a schema of your own.

Use `DtcgReader.noSchema()` to check the token model without the document structure, for example where there is no file system to load a schema from.

### HRDT YAML

Use `HrdtReader` for compact HRDT YAML sources.

HRDT is normalized into the same internal DTCG model used by the rest of the library. One HRDT source may hold several YAML documents, so `read()` returns all of them.

```ts
import { HrdtReader } from "@design-token-kit/core";

const reader = await HrdtReader.create();
const result = reader.read(yamlString);
```

### DESIGN.md

Use `DesignMdReader` for markdown documents with YAML frontmatter.

DESIGN.md is mapped to the internal DTCG model before validation, conversion, showcase generation, or statistics processing.

```ts
import { DesignMdReader } from "@design-token-kit/core";

const reader = await DesignMdReader.create();
const result = reader.read(markdownString);
```

### Pick the format at run time

Ask the `tokenFormats` registry for a reader when the format is not known in advance:

```ts
import { tokenFormats, TokenFormat } from "@design-token-kit/core";

const reader = await tokenFormats.get(TokenFormat.HRDT).createReader();
const result = reader.read(yamlString);
```

`tokenFormats.detect(content)` returns the descriptor of the format the content looks like.

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

- `DtcgWriter`
- `HrdtWriter`
- `DesignMdWriter`

Example: convert parsed DTCG JSON to HRDT YAML.

```ts
import {
  DtcgReader,
  HrdtWriter,
} from "@design-token-kit/core";

const reader = await DtcgReader.create();
const result = reader.read(jsonString);

if (!result.ok) {
  console.error(result.issues);
  process.exit(1);
}

const yaml = new HrdtWriter().write(result.documents[0]);
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
