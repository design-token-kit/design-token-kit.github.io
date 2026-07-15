---
title: "Design Token Kit: A Practical Toolkit for Design Tokens"
description: "Why Design Token Kit exists, what problems it solves, and how validation, conversion, and showcase fit together."
date: 2026-06-16
category: Design Token Kit
---

# Design Token Kit: A Practical Toolkit for Design Tokens

Design tokens help keep colors, spacing, radius values, shadows, and other UI
values in one place. It sounds simple: you create a JSON file, and things get
better. In real work, validation, links between tokens, CSS variables, themes,
showcase pages, and manual editing quickly appear around this simple idea.

![Design Token Kit](intro-design-token-kit-EN.jpg)

## What problem we wanted to solve

In the simplest form, design tokens can look like a normal set of values:

```json
{
  "color": {
    "primary": "#3366ff",
    "background": "#ffffff",
    "text": "#111111"
  }
}
```

This format is easy to read, but it is not enough for a full tool. We need
types, rules, structure, theme support, aliases, and a clear processing
pipeline.

In a real project, questions appear very quickly: how to validate the token
structure, how to make the format easy to edit by hand, how to convert tokens to
CSS, and how to show the result on a static HTML page.

We wanted to make a small and clear tool that covers the basic workflow:
describe tokens, validate them, convert them to CSS, and view the result in a
showcase.

## What is Design Token Kit

[**Design Token Kit**](https://github.com/design-token-kit/design-token-kit) is
an npm tool for working with design tokens.

It helps you go from a token file to a result that can already be used in a
project: check the structure, find errors, generate CSS variables, and build a
simple HTML page for viewing tokens in a browser.

The idea was not to create a large platform for design systems with everything
inside. We wanted to build a clear tool: validation, conversion, and visual
review.

## DTCG JSON support

For the main JSON format, we decided to use
[DTCG](https://www.designtokens.org/), the format from the Design Tokens
Community Group. The idea is to describe design tokens in a predictable way and
move them between different tools without many custom rules.

In DTCG, a token is not just a value. It is an object with a clear structure.
For example, a color token can look like this:

```json
{
  "brand": {
    "color": {
      "$type": "color",
      "primary": {
        "$value": {
          "colorSpace": "srgb",
          "components": [0.2, 0.4, 1],
          "hex": "#3366ff"
        }
      }
    }
  }
}
```

This format is longer than a simple JSON file with colors, but it is easier for
a tool to work with it. The tool can see the token type, check the structure,
process references, find errors, and then safely use this data for conversion.

In Design Token Kit, DTCG JSON is one of the main input formats. It can be
validated, converted to CSS custom properties, converted to another format, and
used to generate a showcase.

There is also an obvious downside: writing this JSON by hand is not always
comfortable.

When there are many tokens, themes, aliases, and nested groups, the file quickly
becomes large. That is why we added a more compact format for manual editing
together with DTCG JSON: HRDT YAML.

## Why we needed HRDT YAML

HRDT means **Human-Readable Design Tokens**. Its goal is to make token files
more compact and easier for people to read, but still keep the same processing
pipeline.

It is not always convenient to write `$type`, `$value`, `colorSpace`,
`components`, and several levels of nesting when you only need to add a new
color or change a spacing value.

In HRDT YAML, the same set of tokens can look much simpler:

```yaml
primitive:
  color:
    white: "#ffffff"
    brand-500: "#2549f6"

semantic:
  color:
    background-page: "{primitive.color.white}"
    action-primary: "{primitive.color.brand-500}"

component:
  button:
    primary:
      background: "{semantic.color.action-primary}"
```

This file is easier to read, easier to edit, and easier to discuss with the
team. Fewer brackets also mean fewer chances to get lost. YAML does not pretend
to save the world, but for writing tokens by hand it is much more convenient.

In real project files, HRDT is built around three top levels: `primitive`,
`semantic`, and `component`. `primitive` stores base values. `semantic`
describes roles like background, text, or spacing. `component` connects these
roles to specific parts of the interface. Because of this, the structure shows
where the base values are, where the meaning is, and where component settings
are.

At the same time, HRDT YAML does not replace DTCG JSON. Inside the tool, YAML is
converted to the common token model and then goes through the same path:
checking, CSS conversion, and showcase generation.

## Architecture: core and cli

We split the project into two parts: `@design-token-kit/core` and
`@design-token-kit/cli`.

`core` is the main logic. It reads tokens, converts them to a common internal
model, validates them, converts them to CSS, and prepares data for the showcase.

`cli` is the layer for terminal usage. It parses commands, accepts file paths
and options, and calls the needed features from `core`.

This split helps keep the main token processing logic separate from the command
line. The CLI stays as a convenient way to run the tool, and `core` can grow as
a separate library.

This is useful for the future. The same logic can be used not only through the
`dtokens` command, but also in other places: for example, in a project build, a
CI pipeline, a separate interface, or design system documentation.

As a result, the CLI is responsible for how the user runs commands, and `core`
is responsible for what happens with the tokens inside.

## CLI commands

The main work with Design Token Kit is done through the `dtokens` command.

Most examples below use files, but the tool can also read tokens from stdin and
URLs. This is useful for pipelines, CI, and cases where tokens are passed
between commands without a temporary file.

When no output file is specified, command results can be written to stdout.

Right now, the CLI has three main commands: `check`, `convert`, and
`showcase`.

### check

The `check` command is the main way to validate token files:

```bash
dtokens check tokens.json
dtokens check tokens.yaml
```

It helps find errors before tokens get into CSS or into the application.

The command supports three scopes.

Schema checks only the input structure:

```bash
dtokens check tokens.json --scope schema
```

Validate runs schema checks and model-level checks:

```bash
dtokens check tokens.yaml --scope validate
```

Lint runs everything from validate and then adds architecture checks:

```bash
dtokens check tokens.yaml --scope lint
```

This split is useful because not every problem is the same kind of problem. A
file can be structurally valid, but still contain broken references or
architecture mistakes.

At the validate level, the tool checks problems such as missing references,
circular references, references to groups instead of tokens, type mismatches,
deprecated references, and duplicate gradient stop positions.

At the lint level, the tool also checks token architecture rules. For example,
it can report invalid cross-layer references and raw values used above the
lowest layer.

### convert

The `convert` command converts tokens between formats:

```bash
dtokens convert tokens.json
dtokens convert tokens.yaml --inform hrdt --outform css --out tokens.css
dtokens convert tokens.json --outform hrdt
```

With this command, you can get CSS custom properties, convert DTCG JSON to HRDT
YAML, or convert HRDT YAML back to DTCG JSON.

For example, if tokens are written in YAML, they can be converted to a CSS file
and used in a project:

```bash
dtokens convert tokens.yaml --inform hrdt --outform css --out tokens.css
```

The result will be a normal CSS file with variables.

### showcase

The `showcase` command generates an HTML page for viewing tokens:

```bash
dtokens showcase tokens.yaml --out showcase.html
```

The showcase can be built from token files or from CSS.

This is useful when you want to quickly check what you got after conversion:
colors, spacing, radius values, shadows, and other values. You do not need to
start a separate app or build large documentation. You just open an HTML file in
the browser.

The tool can be installed in a project, installed globally, or run with `npx`.

For us, it was important that the basic scenario stayed simple: you have a token
file, and you can validate it, convert it, and view the result.

## Working with themes

Design tokens rarely live in only one version. Usually, a dark theme or extra
color schemes appear next to the base values quite quickly.

That is why we treated theme support as one of the basic scenarios in Design
Token Kit.

The idea is simple: some tokens describe default values, and some tokens
describe values for a specific theme. During CSS conversion, this becomes a set
of variables for the base state and separate blocks for themes.

For example:

```css
:root {
  --background-color-base: #ffffff;
  --text-color-primary: #111111;
}

:root[data-theme="dark"] {
    --background-color-base: #111111;
    --text-color-primary: #ffffff;
}
```

Themes are also important in the showcase. The showcase should not only show a
list of tokens. It should also help users understand which values belong to the
base set and which values belong to a specific theme. Otherwise, you can get a
table of variables, but still not really see how tokens are split between
themes.

For now, we keep theme display simple: we show information about available
themes and the tokens themselves, without a complex switcher. For the first
step, this is enough to check the structure and see that the theme was included
in the result.

## What was the hardest part

At first, design tokens look like a clean list of values: colors here, spacing
there, radius values somewhere nearby. Almost like a shopping list, but instead
of bread and milk, you have `primary`, `background`, and `spacing`.

But the more you work with them, the clearer it becomes: the values are not the
only important part. The links between them matter too. You need to understand
the input format, convert tokens to a common model, check the structure, process
references, keep themes working, and still return a result that can be used
later.

Errors are a separate story. Just saying “something went wrong” is not very
helpful. The tool should show where the exact problem is: a reference points to
a missing token, a circular dependency appeared, types do not match, or a whole
group was used instead of a real token.

Another difficult part is the balance between a strict format and comfort for
people. A format that is too flexible is hard to validate. A format that is too
strict is hard to write by hand. A good design token tool lives somewhere
between these two sides.

## What's next

Right now, Design Token Kit covers the basic scenario: tokens can be described,
validated, converted to CSS, and viewed in a showcase. Next, we want to make the
tool smarter when working with tokens.

One direction is diagnostics: finding unused tokens, empty groups, tokens
without descriptions, and other token hygiene problems.

Some architecture diagnostics are already implemented. For example, the tool
can already report invalid cross-layer references and raw values used above the
primitive layer. The next step is to expand this set with more design-system
rules and clearer diagnostics.

We also want to improve the showcase. Right now, it is a simple HTML page for
viewing tokens, but later it can become more useful: show themes better, group
values better, add more visual examples, and help users understand faster what
is really inside a token file.

Another direction is export support. CSS custom properties are a good basic
option, but tokens may also be needed in other formats: SCSS, Tailwind config,
Android XML, and iOS Swift.

Ideally, Design Token Kit should stay small and easy to understand, but slowly
take more routine work around tokens: check them, give hints, show them, and
convert them.

Design Token Kit started as a small tool for our own workflow.
Over time, it became a useful way to validate, convert, and inspect design tokens.
We hope it can also be useful for other teams working with design systems.

[GitHub repository](https://github.com/design-token-kit/design-token-kit)
