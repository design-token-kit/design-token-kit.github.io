---
title: Validate with the Core API
description: Run schema, semantic, and lint checks from TypeScript.
section: Core API
order: 4
---

# Validate with the Core API

Use `TokenChecker` for the complete token check pipeline.

```ts
import { TokenChecker } from "@design-token-kit/core";

const issues = await new TokenChecker().check([
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

`TokenChecker` can perform:

- format and schema checks, reported by the format's own reader;
- semantic checks on the resolved token graph;
- lint checks when the selected scope includes `CheckScope.LINT`.

Use it when your application needs the same general validation flow as the CLI.

A source that fails format or schema checks yields no document at all, so the later stages run only on sources that were read.

## Schema-only validation

Use `CheckScope.SCHEMA` when you only need format and schema validation and do not need semantic checks.

```ts
import { TokenChecker, CheckScope } from "@design-token-kit/core";

const issues = await new TokenChecker({ scope: CheckScope.SCHEMA }).check([
  "./tokens.json",
]);
```

Every readable format validates itself the same way, so HRDT YAML and DESIGN.md sources need no separate validator.

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
- missing descriptions, when `missing-description` is listed in the `checks` option.

## Handle issues

Validation returns issues instead of terminating the process.

This lets the application decide how to display or handle them:

```ts
const checker = new TokenChecker();
const issues = await checker.check(["./tokens.json"]);

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

- an id naming the problem, such as `bad-reference` or `invalid-color`;
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
  TokenChecker,
  DtcgListLoader,
  CssTokenConverter,
} from "@design-token-kit/core";

const sources = ["./tokens.json"];

const issues = await new TokenChecker().check(sources);
const hasErrors = issues.some(
  (issue) => issue.severity === "error",
);

if (!hasErrors) {
  const list = await new DtcgListLoader().load(sources);
  const css = new CssTokenConverter().convertList(list);

  console.log(css);
}
```

## Related pages

- [CLI validation](../../cli/validate/)
- [Parse and load tokens](../../core/parsing/)
- [Convert with the Core API](../../core/conversion/)
