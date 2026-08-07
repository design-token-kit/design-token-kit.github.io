---
title: "Designer Guide: Preparing Tokens in Figma"
description: Rules for preparing Figma variables and styles for DTCG export.
section: Introduction
order: 2
---

# Designer Guide: Preparing Tokens in Figma

This document explains how designers should prepare variables and styles in
Figma so that the export creates a valid `tokens.json` file in DTCG format.

The exported file goes through `@design-token-kit` and is converted into CSS
variables used by the application.

The rules in this document can be stricter than Figma itself or the DTCG
specification.
These are Design Token Kit architecture rules.
They help keep the token structure predictable and keep the same contract
between design and code.

There are two types of rules in this document:

* Architecture rules: how tokens should be organized in Design Token Kit.
* Exporter behavior: what actually happens when exporting from Figma in the
  current plugin version.

## What Tokens Are and Why We Use Them

A token is a named design value.

Tokens turn design into a system with clear names and connections instead of
separate values stored in different layers.

There are three levels:

* `primitive`: the base value, such as a scale or color palette.
* `semantic`: what the value is used for in the UI.
* `component`: which part of a component uses the value.

The result: design and code use the same names, themes can be changed with
aliases, and changing a color palette does not require updating every design
manually.

## How Tokens Get Into the Application

Figma variables and styles are exported into DTCG JSON and then converted into
CSS variables.

The flow is:

* Figma variables and styles.
* Export through Tokens Studio, Figma API, or manual export.
* `tokens.json` in DTCG JSON format.
* `@design-token-kit` conversion.
* `tokens.css` with CSS variables.
* `var(--component-button-primary-bg)` in component code.

The designer's task is to prepare the Figma file so that export creates valid
DTCG JSON without manual fixes.

All rules below are meant to support this.

## Three Token Levels

### primitive

Base scales and raw values.

Only this level can contain real values instead of aliases.

This level can include color palettes, spacing, radii, font sizes, opacity,
`z-index`, animation durations, easing functions, font families, font weights,
and shadows.

Examples:

* `primitive/color/blue/500`
* `primitive/spacing/4`
* `primitive/radius/md`
* `primitive/opacity/disabled`
* `primitive/font/size/base`

Exporter limitation: Figma Variables reliably export mainly colors, sizes,
spacing, radii, thicknesses, font sizes, and opacity.

Other token types need an additional check after export.

### semantic

Semantic roles.

Always an alias to `primitive`.

This level includes things like background, text, border, action, status,
spacing, and shadow.

Examples:

* `semantic/color/bg/canvas`
* `semantic/color/text/primary`
* `semantic/color/border/default`
* `semantic/spacing/control/md`

Raw values should not be used at the `semantic` level.

If the exporter does not block this problem, Design Token Kit checks should find
it later.

### component

The contract for a specific component.

Always an alias to `semantic`.

This level includes properties of buttons, inputs, cards, modals, badges, and
other components.

Examples:

* `component/button/primary/background`
* `component/button/primary/text`
* `component/input/border`
* `component/card/background`

Raw values should not be used at the `component` level.

### Reference Rule

A token can reference only one level below:

```text
component -> semantic -> primitive
```

Not allowed:

* Referencing up: `semantic` to `component`, or `primitive` to `semantic`.
* Skipping a level: `component` directly to `primitive`.
* Referencing the same level: `semantic` to `semantic`.
* Referencing another component token: `component` to `component`.

If the exporter does not block an invalid reference, Design Token Kit checks
should find it later.

## Naming Rules

### Format

* The first segment must be `primitive`, `semantic`, or `component`.
* Use `/` as the separator.
* Use at least 3 segments: `primitive/color/blue`, not `primitive/color`.
* Use `kebab-case`: lowercase Latin letters, hyphens, and numbers.
* The Figma name becomes the base of the token path.

The exporter normalizes name segments to lowercase/kebab-case, but designers
should use the correct format from the start.

This reduces the risk of conflicts and hidden renaming after export.

Examples:

* `primitive/color/blue/500` in Figma becomes `primitive.color.blue.500` in JSON
  and `--primitive-color-blue-500` in CSS.
* `semantic/color/text/primary` becomes `semantic.color.text.primary` and
  `--semantic-color-text-primary`.
* `component/button/primary/background` becomes
  `component.button.primary.background` and
  `--component-button-primary-background`.

Renaming a variable changes the public token name.

After renaming, check all places that use the old name in code, documentation,
and examples.

### Correct and Incorrect

* `primitive/color/blue/500`: correct.
* `Primitive/Color/Blue/500`: incorrect, uppercase letters.
* `semantic/color/text/on-primary`: correct.
* `semantic/color/text/onPrimary`: incorrect, camelCase.
* `component/button/primary/bg`: correct.
* `component/button/primaryBg`: incorrect, words are joined together.
* `semantic/color/bg/canvas`: correct.
* `semantic/color/фон`: incorrect, Cyrillic characters.
* `primitive/spacing/4`: correct.
* `primitive spacing 4`: incorrect, spaces.
* `primitive/color/neutral/100`: correct.
* `primitive-color-neutral-100`: incorrect, `/` is not used as the separator.

The exporter can normalize some of these names, but they are still considered
incorrect in the design file.

## Variables and Styles in Figma

### Variables

Use `COLOR` for solid colors.

DTCG `$type`: `color`.

Example: `semantic/color/text/primary`.

Use `FLOAT` for sizes, spacing, and radii in px.

DTCG `$type`: `dimension`.

Example: `primitive/spacing/4`.

Use `FLOAT` for opacity values from `0` to `1`.

DTCG `$type`: `number`.

Example: `primitive/opacity/disabled`.

For opacity, use the `opacity` segment in the name and set the scope to
`OPACITY` when possible.

In the architecture, `z-index` and other unitless numbers should use `number`.

These tokens need an additional check after export.

Not allowed:

* Gradients as COLOR variables.
* Paint Styles for colors if the file already uses COLOR Variables.
* Mixing dimension values and unitless number values in the same alias chain.

Figma Variables do not provide a direct way to export gradients to DTCG JSON.

If gradients are needed, add them to `tokens.json` separately from Figma.

### Styles

Use Text Style for typography.

DTCG `$type`: `typography`.

Example: `semantic/typography/body`.

Use Effect Style for shadows.

DTCG `$type`: `shadow`.

Example: `semantic/shadow/elevation/md`.

Not allowed:

* Automatic line-height in Text Styles.
* Layer blur or background blur in Effect Styles.
* Mixing shadows and blur in one Effect Style.
* Style names connected to a specific page or screen.

Line-height must have an explicit value in px or `%`.

Only `DROP_SHADOW` and `INNER_SHADOW` should be used.

Blur should not be part of an exported Effect Style.

### Text and Effect Styles Limitation

Figma does not support aliases between styles.

Because of this, the `semantic` or `component` level is defined by the first
segment of the style name.

If a `component` style looks exactly the same as an existing `semantic` style,
use the `semantic` style directly in the Figma component.

Create a separate `component` style only when the component has a unique
typography or shadow that does not match any existing `semantic` style.

The current exporter allows Styles without `semantic/` or `component/`, but the
level should be included in the name to keep the architecture clear:

* `semantic/typography/heading/h1`
* `semantic/shadow/elevation/md`
* `component/typography/button`
* `component/shadow/card`

## Aliases

An alias in Figma is a real reference to another variable.

It is not just two variables with the same visual value.

In DTCG JSON, an alias is written as `{path.to.target.variable}`:

```json
{
  "semantic": {
    "color": {
      "text": {
        "primary": {
          "$type": "color",
          "$value": "{primitive.color.neutral.900}"
        }
      }
    }
  }
}
```

Rules:

* An alias can reference only a local variable from the same Figma file.
* References to variables from external libraries are not allowed.
* An alias must reference a variable of the same type.
* Dimension values and number values must not be mixed.

If the target variable is deleted, export can continue with a warning.

Because of this, always check exporter warnings before using the result.

## Collection Structure

Collections in Figma are used to organize variables.

The token path comes from the variable name, not from the collection name.

The exporter reads Variable names and modes inside collections.

It does not apply special behavior based on collection names such as
`primitive`, `theme`, `density`, or `components`.

Recommended Figma collections:

* `primitive`: scales such as palettes, spacing, radii, and opacity.
  Usually one mode.
* `theme`: semantic color roles that change between themes.
  Modes: Light, Dark, and others.
* `density`: semantic dimension tokens.
  Optional.
  Modes: Comfortable, Compact.
* `components`: component contracts.
  Values are aliases to semantic tokens.
  Usually one mode.

Rules:

* Different dimensions should use different collections.
* Do not mix theme, brand, and density modes in one collection.
* Variable names must be unique across the whole file.
* Two variables must not export to the same DTCG path.
* `components` usually has one mode.
* Components do not know about the theme.
  The semantic alias provides the theme value.
* `primitive` usually has one mode.
* Scales stay the same between themes unless the theme itself changes the
  palette.

Exporter limitation: the same mode names from different collections can end up
in the same `tokens.<mode>.json` file.

Because of this, mode names should be agreed on in advance.

## Themes

A theme is a set of modes in collections.

It is not a fourth token level.

In Light mode, `semantic/color/bg/canvas` can reference
`primitive/color/neutral/0`.

In Dark mode, it can reference `primitive/color/neutral/900`.

The rest of the `component -> semantic` chain stays the same.

Not allowed:

* Theme names in token paths.
* For example, `component/button/dark/background` should not exist.
* There should be one `component/button/background` for all themes.
* Brand modes inside the `theme` collection.

If there are multiple brands, use a separate `brand` collection.

## Using Tokens in Figma Components

A Figma component layer should reference a `component` variable.

Correct:

```text
Button fill -> component/button/primary/background
```

Incorrect:

```text
Button fill -> primitive/color/blue/500
```

Do not skip the `component` level and use a semantic Variable directly if a
component contract already exists for that property.

Exception: typography and shadows can use `semantic` styles directly.

This does not break the architecture because Figma does not support aliases
between styles.

Examples:

* Text Style `semantic/typography/body`
* Effect Style `semantic/shadow/elevation/md`

## Checklist Before Export

* [ ] All variables start with `primitive/`, `semantic/`, or `component/`.
* [ ] Names use `kebab-case`, Latin characters only, with no spaces.
* [ ] No token path has fewer than 3 segments.
* [ ] Final token paths are unique across the exported file.
* [ ] All `semantic` tokens are aliases to `primitive`, with no raw values.
* [ ] All `component` tokens are aliases to `semantic`, with no raw values.
* [ ] There are no references up, across levels, or between tokens on the same
  level.
* [ ] There are no references to external libraries.
* [ ] Exporter warnings have been checked.
* [ ] Theme names are not used in token paths.
* [ ] Theme, brand, and density use separate collections.
* [ ] Component layers reference `component` variables, not `primitive`.
* [ ] Text Styles have an explicit line-height and a name starting with
  `semantic/` or `component/`.
* [ ] Effect Styles contain only shadows and have a name starting with
  `semantic/` or `component/`.
* [ ] The exported `tokens.json` passes Design Token Kit checks.

## Links

* DTCG Format: https://www.designtokens.org/TR/2025.10/format/
* DTCG Schema: https://www.designtokens.org/schemas/2025.10/format.json
* Figma Variables Help: https://help.figma.com/hc/en-us/articles/15145852043927
