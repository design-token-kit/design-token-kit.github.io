---
title: Overview & Getting Started
description: Install the Figma plugin, understand its tabs, and follow the export workflow.
section: Figma Plugin
order: 1
---

# Overview & Getting Started

The Design Token Kit Figma plugin exports local Figma Variables and Styles to
DTCG token files.
It can then convert those files to platform formats, check token architecture,
and audit the design for accessibility and token usage.

The plugin is read-only with respect to the design file.
The Design audit never changes layers, variables, or styles.

## Install the plugin

Install [Design Token Kit from the Figma Community](https://www.figma.com/community/plugin/1661669063434861129/design-token-kit).
Open the plugin from the Figma Plugins menu after installation.

For local development, import the plugin from its `manifest.json` with
**Figma menu -> Plugins -> Development -> Import plugin from manifest**.

## What the plugin does

- Exports local Variables and Styles as DTCG token files.
- Preserves compatible local variable aliases as DTCG references.
- Exports variable modes as theme files.
- Checks token layers, references, raw values, and token metadata.
- Audits text accessibility and whether layers use Variables or Styles.
- Converts generated tokens to CSS, SCSS, Tailwind v4, Android XML, and SwiftUI.
- Shows skipped entries and exporter warnings before you use the output.

The plugin does not export variables from external libraries as local token
definitions.
Aliases must resolve to compatible local variables to be preserved.

## The Token tab

The **Token** tab is the token workflow.
It contains two main areas:

- **Token architecture** shows token counts, the detected layer chain, and the
  result of the selected check set.
- **Choose export format** downloads DTCG or a converted platform output from
  the current Figma file.

The architecture analysis runs when the token data is available.
Use **Analyze tokens** or **Run again** after changing the file or the selected
check set.

See [Token Checks & Issues](../token-checks-issues/) for the check sets and
individual issue fixes.

## The Design tab

The **Design** tab audits either the current page or the entire file.
It reports:

- automated WCAG AA text contrast and manual-review findings for supported
  symbolic text or uncertain contrast cases;
- token-usage warnings for hard-coded colors, spacing and radii, unbound font
  sizes, and direct primitive bindings;
- token coverage and separate accessibility and token-usage scores.

See [Design Audit](../design-audit/) for scan scopes, measurements, findings,
and limitations.

## Recommended workflow

1. Organize Variables and Styles using the [token architecture](../token-architecture/).
2. Open the plugin and review the **Token** tab.
3. Run **Essentials** first and fix broken references and architecture issues.
4. Run **All checks** when you need validation and linting details.
5. Open the **Design** tab and choose **Current page** or **Entire file**.
6. Fix accessibility findings and manually bind hard-coded values to suitable
   suggested tokens.
7. Export DTCG JSON and review the generated files and warnings.
8. Export a platform format only after the DTCG result is readable.

The plugin does not block an export because of architecture warnings or errors.
Review those results before integrating the generated files.

## Related documentation

- [Token Architecture](../token-architecture/)
- [Token Checks & Issues](../token-checks-issues/)
- [Design Audit](../design-audit/)
- [Export & Formats](../export-formats/)
- [DTCG JSON](../../formats/dtcg/)
