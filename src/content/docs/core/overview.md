---
title: Core API overview
description: Use Design Token Kit as a TypeScript library in applications and custom tooling.
section: Core API
order: 1
---

# Core API overview

`@design-token-kit/core` is the runtime library behind Design Token Kit.

Use it when you need to integrate token parsing, validation, conversion, showcase generation, or statistics into your own application.

Node.js 18 or newer is required.

## Install

```bash
npm install @design-token-kit/core
```

## Quick start

```ts
import {
  DtcgChecker,
  DtcgListLoader,
  DtcgTokenCssConverter,
  DtcgTokenScssConverter,
  createTokenHtmlShowcase,
  createTokenStats,
} from "@design-token-kit/core";

const sources = [
  "./tokens.json",
  "./tokens.dark.yaml",
];

const issues = await new DtcgChecker().validate(sources);

if (issues.some((issue) => issue.severity === "error")) {
  console.error(issues);
  process.exit(1);
}

const list = await new DtcgListLoader().load(sources);

const css = new DtcgTokenCssConverter().convertList(list);
const scss = await new DtcgTokenScssConverter().convert([
  "./tokens.json",
]);

const html = await createTokenHtmlShowcase().showcase(sources);
const stats = await createTokenStats().stats(sources);

console.log(css);
console.log(scss);
console.log(html.slice(0, 120));
console.log(stats);
```

## Main APIs

### Checking

- `DtcgChecker`
- `DtcgSchemaValidator`
- `HrdtTokenValidator`

### Loading and parsing

- `DtcgListLoader`
- `DtcgJsonReader`
- `HrdtTokenReader`
- `DesignMdReader`

### Writing documents

- `DtcgJsonWriter`
- `HrdtTokenWriter`
- `DesignMdWriter`
- `DtcgToDesignMdMapper`

### Generating outputs

- `DtcgTokenCssConverter`
- `DtcgTokenScssConverter`
- `DtcgTailwindCssConverter`
- `createTokenCssConverter()`
- `createTokenScssConverter()`
- `createTailwindCssConverter()`

### Reports and previews

- `createTokenHtmlShowcase()`
- `createTokenStats()`

## Source model

Core APIs can work with:

- local files;
- standard input;
- URLs;
- raw token content strings.

Supported token formats:

- DTCG JSON;
- HRDT YAML;
- DESIGN.md.

When multiple token sources are provided:

1. the first source is the base token set;
2. remaining sources are theme overrides.

## Parsed documents and source lists

Use a source-based method when your application starts with file paths or other input sources.

Use document- or list-based methods when the tokens are already loaded:

- `convertDocument()` for a parsed document;
- `convertList()` for a prepared `DtcgList`.

Avoid loading the same sources again when a parsed document or list is already available.

## Related pages

- [Parsing and loading](/docs/core/parsing/)
- [Validation](/docs/core/validation/)
- [Conversion](/docs/core/conversion/)
- [CLI getting started](/docs/getting-started/)
