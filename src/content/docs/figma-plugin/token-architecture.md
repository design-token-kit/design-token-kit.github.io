---
title: Token Architecture
description: Organize Figma Variables and Styles into primitive, semantic, and component token layers.
section: Figma Plugin
order: 2
---

# Token Architecture

The plugin uses three architecture layers to keep design decisions reusable
and predictable:

- **Primitive** tokens contain base values such as a palette, spacing scale,
  radius scale, opacity, or font size.
- **Semantic** tokens describe a role in the interface, such as text, surface,
  border, action, or status.
- **Component** tokens define the contract for a component and its state.

Only primitive tokens should contain raw values.
Semantic tokens should reference primitive tokens.
Component tokens should reference semantic tokens.

```text
component -> semantic -> primitive
```

This is a Design Token Kit architecture rule.
It can be stricter than Figma or the DTCG format itself.

## Naming Variables and Styles

Use `/` in Figma names to create token path segments.
The first segment should be `primitive`, `semantic`, or `component`.
Use at least three segments and use lowercase kebab-case:

```text
primitive/color/brand/500
semantic/color/text-default
component/button/primary/background
```

The exporter normalizes names to lowercase kebab-case, but using the canonical
name in Figma keeps the source easy to review.
Use Latin letters, numbers, and hyphens in each segment.

Safe plural layer names are accepted and mapped to their canonical forms:

- `primitives` becomes `primitive`;
- `semantics` becomes `semantic`;
- `components` becomes `component`.

Canonical singular names are preferred.

The same Figma name becomes a dot-separated DTCG path and a hyphenated CSS
custom property:

```text
Figma:  primitive/color/blue/500
DTCG:   primitive.color.blue.500
CSS:    --primitive-color-blue-500
```

Renaming a Variable or Style changes the public token name.
Update consumers that use the old name.

## Variables and Styles

Use Figma Variables for values that can participate in aliases and modes.

- `COLOR` variables export as DTCG `color` tokens.
- `FLOAT` variables for sizes, spacing, and radii export as `dimension` tokens.
- Opacity floats export as DTCG `number` tokens.
- Font-weight floats export as `fontWeight` tokens.

The plugin also exports local styles:

- Text Styles export as `typography` tokens.
- Effect Styles export as `shadow` tokens.
- Paint Styles can provide fallback color tokens when color Variables are not
  available.

Use explicit line heights in Text Styles when possible.
Automatic line height exports as the unitless value `1`.

Figma Variables do not provide a direct gradient export to DTCG JSON.
Add gradients to the token source separately when they are required.

For Effect Styles, use `DROP_SHADOW` or `INNER_SHADOW` only.
Layer blur and background blur should not be included in an exported Effect
Style.

## Aliases and reference rules

An alias must be a real Figma Variable reference.
Two Variables with the same raw value are not an alias.

The plugin preserves an alias when its target is a local Variable of the same
token type and has a valid token path.
For example:

```json
{
  "semantic": {
    "color": {
      "text-default": {
        "$type": "color",
        "$value": "{primitive.color.slate.100}"
      }
    }
  }
}
```

Use only the adjacent lower layer:

- semantic -> primitive;
- component -> semantic.

Do not reference upward, skip a layer, reference a token in the same layer, or
reference another component token.
Do not reference Variables from external libraries.
Do not mix dimension and unitless number values in one alias chain.

If an alias target is deleted, the exporter can continue with a warning.
Always review exporter warnings before using the output.

## Reference provenance

When Figma composes a color from aliases to individual color properties, the
exporter can preserve the original aliases in the optional DTCG extension
`io.github.design-token-kit.referenceSources`:

```json
{
  "$extensions": {
    "io.github.design-token-kit": {
      "referenceSources": {
        "#/primitive/color/blue/$value/colorSpace":
          "{semantic.color.action}"
      }
    }
  }
}
```

The `referenceSources` object maps a DTCG property pointer inside `$value` to
the original Figma alias.
Core's `layer-reference` check reads this metadata when a composed color's
resolved property reference does not show the original alias layer.
The CLI uses the same Core check for the exported file.

This extension is optional metadata, not a fourth token layer.
It does not change the semantic theme architecture or the recommended
collection modes.
Consumers that do not know this vendor extension can ignore it and use the
token value normally.

## Collections, modes, and themes

The token path comes from the Variable name, not the collection name.
Collections organize Variables and modes but do not create token layers.

The recommended Figma collection layout matches the token layers:

- `Primitive` contains the raw palette and scales and uses one mode.
- `Semantic` maps primitives to design roles and contains the Light and Dark
  theme modes.
- `Component` contains component contracts that alias semantic tokens and uses
  one mode.

Primitive values stay stable between themes.
The shared primitive palette must include the values needed by every theme.
For example, the light theme can use `primitive/color/white`, while the dark
theme maps `semantic/color/background-page` to
`primitive/color/slate/900`.
The primitive value is not overridden in a dark mode.

Dark themes remap semantic roles to different existing primitives.
For example, `semantic/color/action-primary` can reference
`primitive/color/brand/500` in Light and `primitive/color/brand/400` in Dark.
The component reference remains unchanged:

```text
component/button/primary/background
    -> semantic/color/action-primary
```

This is the recommended architecture, not a limitation of the exporter.
The plugin can export modes from multiple local collections.
It writes the default mode to `tokens.json`, writes non-default modes to
`tokens.<mode>.json`, and combines values with matching mode names.
Use a single mode in the Primitive and Component collections so that theme
changes stay in Semantic and the exported files preserve the intended token
graph.

If modes exist in multiple collections, agree on their names because matching
mode names are combined into one exported file.
Variable names must be unique across the file, and two Variables must not
export to the same token path.

A theme is a set of collection modes, not a fourth token layer.
Keep theme names out of token paths:

```text
Correct:   component/button/background
Incorrect: component/button/dark/background
```

The component alias remains the same while the semantic token resolves to a
different primitive value in another mode.

Mode names are used when the plugin creates theme files.
Agree on mode names across collections because matching mode names can be
combined into one exported file.

## Using tokens in components

A Figma component layer should use a component Variable when a component
contract exists:

```text
Button fill -> component/button/primary/background
```

Avoid binding a component directly to a primitive value:

```text
Button fill -> primitive/color/blue/500
```

Typography and shadow styles are an exception because Figma Styles do not
support aliases.
Use a semantic Style directly when the component has no unique typography or
shadow decision.

## Example architecture

The following chain keeps a palette value separate from its role and component
contract:

```text
primitive/color/brand/500
        |
        v
semantic/color/action-primary
        |
        v
component/button/primary/background
```

Changing the primitive value or the semantic mode updates the component without
renaming the component token.

## Before exporting

- Use canonical layer names and kebab-case paths.
- Keep raw values in primitive tokens.
- Keep aliases local and type-compatible.
- Check that semantic and component references follow the layer order.
- Keep theme modes in the `Semantic` collection.
- Use one mode in the `Primitive` and `Component` collections.
- Include the primitive values needed by every theme in the shared palette.
- Use component Variables in component layers where a contract exists.
- Review architecture findings and exporter warnings.
