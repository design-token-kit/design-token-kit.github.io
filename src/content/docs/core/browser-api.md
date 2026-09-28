---
title: Browser API
description: Validate, convert, showcase, and measure design tokens in a browser application.
section: Core API
order: 2
---

# Browser API

Use the browser entry point when token content is already available in a
frontend application.
Typical sources include a selected file, pasted text, or content fetched by
the host application.

The API runs entirely in memory.
It does not read files, access paths, or contact a backend.

> **Experimental.** The browser API may change in minor releases.

## Install

Install the core package in the frontend project:

```bash
npm install @design-token-kit/core
```

The browser API is included as a package subpath.
It does not require a separate CLI package or backend.
Use it from a TypeScript or JavaScript application built with a bundler such
as Vite, Astro, webpack, or a similar tool.

## Validate and convert

The host application owns file selection and downloads.
Pass the file content to `BrowserTokenToolkit` as a string.

```ts
import {
  BrowserTokenToolkit,
  BrowserTokenValidationError,
  CheckScope,
  Format,
} from "@design-token-kit/core/browser";

const file = document.querySelector<HTMLInputElement>("#tokens")?.files?.[0];
if (file === undefined) throw new Error("Select a token file first.");

const input = {
  base: {
    source: file.name,
    content: await file.text(),
    format: Format.DTCG,
  },
};
const toolkit = new BrowserTokenToolkit();
const issues = toolkit.check(input, { scope: CheckScope.LINT });

if (issues.some((issue) => issue.severity === "error")) {
  console.error(issues);
} else {
  try {
    const [output] = toolkit.convert(input, Format.CSS);
    console.log(output?.fileName, output?.content);
  } catch (error) {
    if (error instanceof BrowserTokenValidationError) {
      console.error(error.issues);
    } else {
      throw error;
    }
  }
}
```

Set `format` when the input format is known.
Omit it to detect DTCG JSON, HRDT YAML, or DESIGN.md from the source name and
content.

Supported input formats:

- DTCG JSON;
- HRDT YAML;
- DESIGN.md.

## Outputs

`convert()` accepts these output formats:

- `Format.CSS`;
- `Format.SCSS`;
- `Format.TAILWIND_V4`;
- `Format.SWIFT_UI`;
- `Format.ANDROID`;
- `Format.FIGMA_SCRIPT`;
- `Format.DTCG`;
- `Format.HRDT`;
- `Format.DESIGN_MD`;
- `"showcase"`.

It returns one or more `BrowserTokenOutput` objects.
Each output contains a `fileName` and `content` field.
The host application can display the content or create a `Blob` for download.

```ts
const outputs = toolkit.convert(input, Format.SCSS);

for (const output of outputs) {
  console.log(output.fileName, output.content);
}
```

Use `stats()` to get token statistics:

```ts
const statistics = toolkit.stats(input);
console.log(statistics);
```

## Themes

Pass theme overrides in the `themes` map.
Theme names may contain letters, numbers, hyphens, and underscores.
The name `base` is reserved for the base document.

```ts
const input = {
  base: {
    source: "tokens.json",
    format: Format.DTCG,
    content: await baseFile.text(),
  },
  themes: {
    dark: {
      source: "tokens.dark.json",
      format: Format.DTCG,
      content: await darkFile.text(),
    },
  },
};
```

SCSS conversion returns separate files such as `tokens.base.scss` and
`tokens.dark.scss`.
CSS conversion returns one `tokens.css` file containing the base `:root`
variables and each theme override.

## Diagnostics and errors

`check()` returns an array of diagnostics.
It does not throw for invalid token content.

`convert()` and `stats()` always run the required schema and model checks.
They throw `BrowserTokenValidationError` when errors prevent the operation.
The error exposes the structured diagnostics through its `issues` property.

```ts
try {
  const outputs = toolkit.convert(input, Format.CSS);
} catch (error) {
  if (error instanceof BrowserTokenValidationError) {
    renderIssues(error.issues);
  } else {
    throw error;
  }
}
```

## Browser security

Schema validation uses AJV and compiles schemas at runtime.
If the application uses a Content Security Policy, its `script-src` must allow
`'unsafe-eval'` for schema validation to work.

URL loading belongs to the host application.
The host must fetch the URL and pass the response content to the toolkit.
The remote server must allow the request through its CORS policy.
