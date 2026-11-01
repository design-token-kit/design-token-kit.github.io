---
title: Export & Formats
description: Export DTCG tokens and convert them to CSS, SCSS, Tailwind v4, Android XML, and SwiftUI.
section: Figma Plugin
order: 5
---

# Export & Formats

The plugin exports the current Figma file to DTCG JSON first.
Platform formats are generated from the DTCG files in the plugin.
This keeps the same token graph and aliases as the canonical export.

Open the **Token** tab and choose a format in **Choose export format**.
Generated files download from the plugin.

## DTCG JSON

**DTCG JSON** is the canonical plugin output.
The plugin reads local Variables and Styles and writes token paths, `$type`,
`$value`, descriptions, and compatible aliases.

Typical files are:

- `tokens.json` for the default mode;
- `tokens.<mode>.json` for each non-default Variable mode.

For example, a Dark mode can produce `tokens.dark.json`.
The base file and mode files are used together when the plugin converts platform
outputs.

The exporter supports these values from the current Figma implementation:

- `color` from local color Variables;
- `dimension` from local float Variables;
- `number` from opacity float Variables;
- `fontWeight` from font-weight float Variables;
- `typography` from local Text Styles;
- `shadow` from local Effect Styles.

Paint Styles can provide fallback color tokens when color Variables are not
available.

## CSS

**CSS** produces `tokens.css` with CSS custom properties.
Token paths become names such as:

```css
--semantic-color-text-primary
```

Theme input files are emitted as theme overrides by the core CSS converter.
Use this output when the application consumes `var(--token-name)` values.

## SCSS

**SCSS** produces `tokens.scss`.
When modes are present, the plugin also produces theme-specific SCSS files such
as `tokens.dark.scss`.

Use the SCSS output when tokens are consumed as Sass variables or when the
project needs Sass compilation before the browser receives CSS.

## Tailwind CSS v4

**Tailwind v4** produces `tokens.tailwind.css` with Tailwind v4 theme
variables.
The generated output includes the Tailwind import and an `@theme` block.

The core converter maps token paths to Tailwind namespaces.
Use the `design-token-kit.tailwindNamespace` extension with the supported
`breakpoint` value when a token needs explicit breakpoint mapping.

Unsupported namespace values are reported by the
[`bad-tailwind-namespace` check](../token-checks-issues/#bad-tailwind-namespace).

## Android XML

**Android XML** produces Android resource XML files from the DTCG token list.
The converter can return more than one resource file because Android resources
are separated by type.

Review the generated resource paths before copying them into
`app/src/main/res`.

## SwiftUI

**SwiftUI** produces `DesignTokens.swift`.
Use the generated source in the project target that consumes the design token
values.

## Themes and modes

The default mode from each Variable collection is written to `tokens.json`.
Each non-default mode is written to a file named from the mode, such as
`tokens.dark.json` or `tokens.brand-a.json`.

Mode names are normalized for file names.
If different collections use the same mode name, the plugin combines those
mode values in the same theme file.
Keep mode naming consistent across collections before exporting.

Themes do not create a fourth token architecture layer.
Keep the `component -> semantic -> primitive` reference chain the same in every
mode and change the semantic values that map to the theme.

## Export warnings and failures

The plugin reports skipped entries and warnings during DTCG export.
Examples include incomplete names, unresolvable aliases, and values that need
review after export.

Platform conversion reads the generated DTCG files before converting them.
If those files cannot be read, the selected platform export fails with the
reader issue instead of producing partial output.

Architecture warnings and errors shown by the Token tab do not themselves
block export.
Review them and the exporter warnings before using generated files in code.

## Diagnostic exports

The plugin also has diagnostic exports for raw Figma Plugin API and REST API
JSON.
These files are for debugging differences between APIs.
They are not token files and should not be passed to a token converter.

## Related documentation

- [Overview & Getting Started](../overview/)
- [Token Architecture](../token-architecture/)
- [DTCG JSON](../../formats/dtcg/)
- [CLI conversion](../../cli/convert/)
- [Core conversion API](../../core/conversion/)
