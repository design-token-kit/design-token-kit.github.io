---
title: Token Checks & Issues
description: Run Essentials or All checks and fix token validation, architecture, and lint findings.
section: Figma Plugin
order: 3
---

# Token Checks & Issues

The **Token** tab analyzes the DTCG files generated from the current Figma
file.
It checks token architecture separately from the [Design Audit](../design-audit/),
which checks the visual design and token usage on Figma layers.

The analysis is not a replacement for DTCG schema validation.
It checks the generated token graph, layer dependencies, raw values, and
selected validation and lint rules.

## Rule sets

### Essentials

**Essentials** covers the core architecture rules.
It reviews token layers, reference order, raw values, broken references, and
component independence.
Violations are shown as warnings.

### All checks

**All checks** adds detailed validation and linting to Essentials.
Issues are classified as errors or warnings.

The plugin description is:

> Review token layers, references, and raw values.
> Essentials covers core architecture rules.
> All checks adds detailed validation and linting.

The check set is selected before pressing **Analyze tokens** or **Run again**.

## Severity and results

Each check card is shown as one of these states:

- **OK** means that no issue was found.
- **Warning** means that the token architecture or metadata needs review.
- **Error** means that the token data cannot be safely resolved, or a core
  validation check reports an error.

In Essentials, architecture cards are presented as warnings for compatibility
with the plugin workflow.
Broken references remain errors.
The All checks view uses the severity from the underlying core check.

Architecture findings do not block export.
Fix them before committing generated files.
If the generated DTCG files cannot be read, a platform conversion can still
fail because converted formats are built from the DTCG result.

## Individual checks

<a id="root-layer"></a>
### Non-standard layer names

The plugin uses the first segment of a Variable or Style name as its
architecture layer.
The standard names are `primitive`, `semantic`, and `component`.

The plugin also accepts the plural aliases `primitives`, `semantics`, and
`components`.
When it finds one, it normalizes the exported token path but shows a warning
under `#root-layer`.

**Warning:** A name uses an accepted alias instead of the canonical layer name.
For example, the plugin can report:

```text
Non-standard layer name "primitives" detected.
Consider renaming it to "primitive" for consistency.
```

**Why it matters:** Canonical names make the token architecture clear in Figma,
the exported DTCG files, and the plugin results.
The alias is supported, but different names for the same layer make files
harder to review.

**Correct:**

```text
primitive/color/blue/500
semantic/color/text/primary
component/button/primary/background
```

**Accepted but warned:**

```text
primitives/color/blue/500
semantics/color/text/primary
components/button/primary/background
```

**How to fix in Figma:**

1. Open the local Variables or Styles used by the export.
2. Edit the name of each affected Variable or Style.
3. Replace the first segment with `primitive`, `semantic`, or `component`.
4. Keep `/` between the path segments.
5. Run the token analysis again.

Rename the Variable or Style name, not the collection name.
The token path comes from the Variable or Style name.

The same `root-layer` card can also report a token path outside the configured
architecture layers.
Such a path must start with `primitive`, `semantic`, or `component`.
Rename the first segment in Figma and run the analysis again.

<a id="layer-reference"></a>
### Invalid layer references

The plugin expects references to follow the architecture order:

```text
component -> semantic -> primitive
```

The `#layer-reference` warning appears when a semantic token does not reference
a primitive token, a component token does not reference a semantic token, or a
token references another token in the same layer.

**Why it matters:** Each layer has one responsibility.
Primitive tokens provide values.
Semantic tokens provide roles.
Component tokens provide component contracts.
Keeping the links between adjacent layers makes theme and mode changes
predictable.

**Correct:**

```text
semantic/color/text/primary
    -> primitive/color/neutral/900

component/button/primary/background
    -> semantic/color/action/primary
```

**Incorrect:**

```text
component/button/primary/background
    -> primitive/color/blue/500
```

This skips the semantic layer.

```text
semantic/color/text/primary
    -> component/button/primary/text
```

This references upward.

```text
semantic/color/text/primary
    -> semantic/color/text/secondary
```

This references another token in the same layer.

**How to fix in Figma:**

1. Find the affected Variable in the local Variables panel.
2. Check the first segment of its name.
3. Open its alias value.
4. Select a target from the adjacent lower layer.
5. If the required target does not exist, create it in the correct layer and
   make the affected Variable reference it.
6. Run the token analysis again.

For a component token, create or use a semantic token first.
Do not bind the component directly to a primitive token.

<a id="raw-value-usage"></a>
### `raw-value-usage` - Raw values stay in primitive tokens

**Detects:** A semantic or component token contains a raw value instead of a
reference.

**Why it matters:** Raw values above primitive make roles and component
contracts harder to change across themes and modes.

**Example:** `semantic/color/text/primary` contains `#172033` directly.

**Fix:** Move the raw value to a primitive token and make the semantic token
reference it.

<a id="bad-reference"></a>
### `bad-reference` - No broken token references

**Detects:** A missing reference target, a reference to a group instead of a
token, a circular reference, or a reference to a deprecated token.

**Why it matters:** The token graph cannot be resolved consistently when an
alias target is missing or ambiguous.

**Example:** `{primitive.color.blue.500}` is used but that token does not exist.

**Fix:** Create the missing target, correct the Variable alias, or break the
cycle.
Do not point a token at a group path.

<a id="ref-to-group"></a>
#### `ref-to-group`

The reference points to a named group rather than a token with `$value`.
Reference the complete token path instead.

<a id="circular-reference"></a>
#### `circular-reference`

The alias chain returns to a token already in the chain.
Change one alias to point to a lower-level token that ends in a raw primitive
value.

<a id="deprecated-reference"></a>
#### `deprecated-reference`

The reference resolves to a deprecated token.
Replace it with the supported token before the deprecated token is removed.

<a id="component-isolation"></a>
### `component-isolation` - Component tokens stay independent

**Detects:** A component token references another component token.

**Why it matters:** Component contracts should be independently mapped to
semantic roles.
Component-to-component references create hidden coupling between components.

**Example:** `component/card/background` references
`component/button/primary/background`.

**Fix:** Move the shared decision to a semantic token and reference that
semantic token from both components.

<a id="type-mismatch"></a>
### `type-mismatch` - Token aliases keep their type

**Detects:** An aliased token declares a type that differs from the type of the
token it resolves to.

**Why it matters:** A color, dimension, number, or composite value cannot be
used safely where another DTCG type is expected.

**Example:** A token declares `$type: "color"` but aliases a `dimension` token.

**Fix:** Correct the alias target or change the declared type to match the
resolved token.

<a id="gradient-duplicate-stop"></a>
### `gradient-duplicate-stop` - Gradient stops are unambiguous

**Detects:** Two stops in one gradient use the same numeric position.

**Why it matters:** A renderer cannot determine a unique transition when stop
positions are duplicated.

**Example:** Two stops both use `position: 0.5`.

**Fix:** Give each stop a distinct position and keep the stops ordered for the
intended gradient.

<a id="empty-group"></a>
### `empty-group` - Token groups are not empty

**Detects:** A named group contains no tokens and no child groups.

**Why it matters:** Empty groups add structure without defining a token and can
be left behind after a Variable is renamed or removed.

**Example:** `semantic/color/status` exists as a group but has no children.

**Fix:** Add the intended token or remove the empty group from the source.

<a id="missing-description"></a>
### `missing-description` - Tokens have descriptions

**Detects:** A token has no non-empty `$description`.

**Why it matters:** A description records the token's role and helps designers
and developers understand how it should be used.

**Example:** A Variable exports a token without a description in its settings.

**Fix:** Add a description in Figma Variable settings, then run the analysis
again.
This check is opt-in in the core library and is included by the plugin's All
checks set.

<a id="bad-tailwind-namespace"></a>
### `bad-tailwind-namespace` - Tailwind namespaces are valid

**Detects:** A `design-token-kit.tailwindNamespace` extension contains an
unsupported value.

**Why it matters:** Tailwind v4 output uses the extension to map a token to the
right theme namespace.
An unsupported value makes the mapping unreliable.

**Example:** A token declares `tailwindNamespace: "spacing"`.

**Fix:** Remove the extension for automatic mapping or use the supported
`breakpoint` value when the token is a breakpoint.

<a id="bad-rem-base"></a>
### `bad-rem-base` - The rem base is valid

**Detects:** The root `design-token-kit.remBase` extension is present but is not
a finite positive number.

**Why it matters:** Platform converters need a usable base when converting
dimension values to `rem`.

**Example:** `remBase` is `0`, a string, or `null`.

**Fix:** Set a positive number or remove the extension to use the converter's
default.

## Readable token files

Before the individual checks run, the plugin reads the generated DTCG files.
If a generated file cannot be read, the panel reports that the token files are
not readable and shows the reader issue.

Fix the exporter warning or malformed generated data, then run the analysis
again.

## Validation versus linting

The core pipeline groups checks by purpose:

- **Validation** checks token correctness, including references, type aliases,
  gradient stops, Tailwind namespace extensions, and the rem base extension.
- **Linting** checks architecture and maintainability, including root layers,
  layer references, raw value placement, empty groups, and descriptions.

Use [CLI validation](../../cli/validate/) when you need to check token files
outside Figma or run the same checks in CI.
