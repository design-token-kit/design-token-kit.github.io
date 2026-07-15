---
title: Validate with the Core API
description: Run schema, semantic, and lint checks from TypeScript.
section: Core API
order: 3
---

# Validate with the Core API

Use `DtcgChecker` for the complete token check pipeline.

```ts
import { DtcgChecker } from "@design-token-kit/core";

const issues = await new DtcgChecker().validate([
  "./tokens.json",
  "./tokens.dark.json",
]);

for (const issue of issues) {
  console.log(
    issue.severity,
    issue.sourcePath,
    issue.tokenPath,
    issue.message,
  );
}
```

## Full pipeline

`DtcgChecker` can perform:

- format and schema checks;
- semantic checks on the resolved token graph;
- lint checks when the selected scope includes linting.

Use it when your application needs the same general validation flow as the CLI.

## Schema-only validation

Use `DtcgSchemaValidator` when you only need DTCG schema validation and do not need semantic checks.

```ts
import { DtcgSchemaValidator } from "@design-token-kit/core";
```

Use `HrdtTokenValidator` for HRDT-specific validation.

```ts
import { HrdtTokenValidator } from "@design-token-kit/core";
```

## Semantic checks

The model validation layer detects problems such as:

- unresolved references;
- circular references;
- references to groups;
- type mismatches;
- duplicate gradient stops;
- deprecated token usage.

## Lint checks

The lint layer can check:

- root layer names;
- allowed references between layers;
- raw value placement;
- empty groups;
- missing descriptions.

## Handle issues

Validation returns issues instead of terminating the process.

This lets the application decide how to display or handle them:

```ts
const checker = new DtcgChecker();
const issues = await checker.validate(["./tokens.json"]);

const errors = issues.filter(
  (issue) => issue.severity === "error",
);

if (errors.length > 0) {
  throw new Error(
    `Token validation failed with ${errors.length} error(s).`,
  );
}
```

Issue data can include:

- severity;
- source path;
- token path;
- message.

Not every issue has to contain every location field, so UI code should handle missing paths safely.

## Validate before conversion

A common application flow is:

1. validate token sources;
2. stop when errors are present;
3. load the token list;
4. generate an output.

```ts
import {
  DtcgChecker,
  DtcgListLoader,
  DtcgTokenCssConverter,
} from "@design-token-kit/core";

const sources = ["./tokens.json"];

const issues = await new DtcgChecker().validate(sources);
const hasErrors = issues.some(
  (issue) => issue.severity === "error",
);

if (!hasErrors) {
  const list = await new DtcgListLoader().load(sources);
  const css = new DtcgTokenCssConverter().convertList(list);

  console.log(css);
}
```

## Related pages

- [CLI validation](../../cli/validate/)
- [Parse and load tokens](../../core/parsing/)
- [Convert with the Core API](../../core/conversion/)
