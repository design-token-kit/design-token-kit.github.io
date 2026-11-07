---
title: Design Audit
description: Check accessibility and token usage on the current page or entire Figma file.
section: Figma Plugin
order: 4
---

# Design Audit

The **Design** tab audits the visible design in the open Figma file.
It answers two different questions:

- **Accessibility:** can the text be read against its background?
- **Token usage:** is the design bound to Variables and Styles instead of
  hard-coded values?

The audit is read-only.
It never changes the Figma file.

Token architecture itself is checked on the [Token tab](../token-checks-issues/).

## Scan scope

Choose a scope before running the audit:

- **Current page** audits the layers on the page open in Figma.
- **Entire file** loads every page and audits them all.

For an entire-file scan, each layer path starts with its page name.
Large files can take longer to load.

The audit runs when the Design tab opens, when the scope changes, and when you
press **Run again**.

## Accessibility checks

Design Token Kit checks text contrast against WCAG 2.2 AA when the text and its
background can be measured.
It reports supported symbolic text layers and other uncertain contrast cases
that need manual review.
The score shows the percentage of automated checks passed, not overall
accessibility or WCAG conformance.
Some requirements cannot be verified from a Figma design alone.
The audit does not modify the Figma file.

<a id="text-contrast"></a>
### Text contrast - WCAG 1.4.3

The Design tab reports **Low text contrast (WCAG AA)** when an automated result
is below the minimum in [WCAG 1.4.3: Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

- Normal text needs at least `4.5:1`.
- Large text needs at least `3:1`.
  Large text is `24px` or larger, or `18.66px` or larger with a font weight of
  at least `700`.

The ratio is calculated from the visible text colour and the background sampled
under the centre of the text. Text paint opacity and layer opacity are included.
Translucent text is composited over the background before the ratio is measured.
The background must resolve to an opaque colour for an automated result.

Fix it by using a darker text colour on light surfaces or a lighter colour on
dark surfaces.
A semantic text Variable is preferred when it is known to work on the surface.

<a id="enhanced-text-contrast"></a>
### Enhanced text contrast - WCAG 1.4.6

The Core accessibility audit also supports the optional WCAG AAA threshold in
[WCAG 1.4.6: Contrast (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html):

- Normal text needs at least `7:1`.
- Large text needs at least `4.5:1`.

The Figma Plugin Design tab runs WCAG AA by default and does not provide a
user-facing AAA selector. These thresholds are available to Core consumers that
select the AAA level.

<a id="text-size"></a>
### Minimum text size - Core readability rule

The `12px` minimum text-size rule remains a reusable Core readability rule. It is
not a current Figma Design tab Accessibility warning and is not itself a WCAG
conformance requirement.

This compatibility anchor is retained for existing links.

These reusable readability rules are documented in the
[Core Design Audit API](../../core/audit/).

<a id="line-height"></a>
### Minimum body line height - Core readability rule

The `1.3` minimum body line-height rule remains a reusable Core readability rule.
It is not a current Figma Design tab Accessibility warning and is not itself a
WCAG conformance requirement.

This compatibility anchor is retained for existing links.

<a id="text-contrast-unchecked"></a>
<a id="design-audit-manual-review"></a>
### Contrast needs manual review

Automatic contrast evaluation cannot reliably handle:

- images and gradients;
- mixed fills;
- transparency or an uncertain background;
- graphical symbols with unclear roles;
- unsupported graphical elements that need human assessment.

The UI can show these labels:

- `Role unclear` means the plugin cannot determine whether a symbolic text layer
  is meaningful text or a graphical element.
- `Contrast unavailable` means the plugin does not have usable colours or an
  opaque background for a reliable ratio.
- A measured ratio such as `3.58:1` is informational when the element still
  needs manual review. It does not automatically classify the element as
  Passed or Failed.

Manual review is not a failure and does not reduce the score. It is excluded
from the automated score and appears as **Not checked**.

<a id="non-text-contrast"></a>
### Non-text contrast - WCAG 1.4.11

[WCAG 1.4.11: Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
requires at least `3:1` for significant graphical elements in the applicable
cases.

The plugin measures contrast for supported symbolic `TEXT` elements when their
colours are available. It cannot reliably determine whether an arbitrary
graphical element is essential, decorative, active, or inactive. Uncertain
elements remain in **Manual review**.

Arbitrary vector icons, controls, and strokes are not automatically classified
as Passed or Failed. A measured ratio alone is not proof of WCAG conformance.

## How the audit measures text

The text colour comes from the visible text fill.
Paint opacity and layer opacity are included.
Mixed character colours and gradients cannot be reduced to one text colour.

The background is sampled below the centre of the text:

1. Visible siblings below the text are inspected from nearest to farthest.
2. Parent frame fills are inspected.
3. The same process continues through the parent hierarchy.
4. The page background is used, then white if no opaque background is found.

The plugin blends translucent paints in the same order as the rendered design.
It reads Variables using the mode applied to the layer or frame.

Font size and weight come from the text layer.
When text mixes sizes or weights, the smallest size and lightest weight are
used because they are the hardest to read.

WCAG contrast uses relative luminance and the standard contrast ratio:

```text
(lighter luminance + 0.05) / (darker luminance + 0.05)
```

The plugin audits the WCAG AA contrast criterion by default. Background sampling
uses layer geometry and fills rather than the rendered image, so a text layer
that spans multiple backgrounds or sits over an image or gradient may require
manual review.

## Token usage checks

Token usage checks whether the following properties are bound to Variables or
Styles:

- visible solid fills;
- visible solid strokes with a stroke width;
- corner radii;
- auto-layout gaps and wrapped row gaps;
- positive auto-layout padding values;
- text font sizes.

Gradients, images, effects, stroke widths, sizes, and opacity are not included
in token usage coverage.

Instances and their content are skipped because their properties come from the
main component.
Overrides made on an instance are not audited.

<a id="hardcoded-value"></a>
### Hard-coded colors

**Warning:** A visible solid fill or stroke uses a fixed color without a
Variable or Paint Style.

For each affected property, the plugin can show:

- **Exact match:** a local Variable or Paint Style with the same color;
- **Closest match:** a local Variable or Paint Style within the color tolerance;
- **No match found:** no suitable local Variable or Paint Style was found.

Exact colour matches use the same `#rrggbbaa` value.
Close colour matches use an Oklab distance of at most `0.02` and a compatible
alpha value.
The group statistics show how many affected properties have a matching Variable
or Style.

Expand the warning, inspect the affected fill or stroke and its suggestion, use
**Select** to locate the layer, and manually bind the property to an appropriate
local Variable or Paint Style in Figma.

<a id="hardcoded-spacing"></a>
### Hard-coded spacing and radii

**Warning:** An auto-layout gap, auto-layout padding value, or corner radius
uses a fixed dimension instead of a Variable.

For each affected property, the plugin can show:

- **Exact match:** a local Variable with the same dimension;
- **Closest match:** a local Variable within the dimension tolerance;
- **No match found:** no suitable local Variable was found.

The matching tolerance for dimensions is `1px`.
The group statistics show how many affected properties have a matching Variable.

Use **Select** to locate the layer, then manually replace the hard-coded gap,
padding, or radius with an appropriate local Variable in Figma.

<a id="hardcoded-font-size"></a>
### Unbound font sizes

**Warning:** A text layer uses a fixed font size without a Text Style or
Variable.

For each affected property, the plugin can show:

- **Exact font-size match:** a local Text Style or Variable with the same font
  size;
- **Closest font-size match:** a local Text Style or Variable with a nearby font
  size;
- **No font-size match found:** no suitable local Text Style or Variable was
  found.

The group statistics show how many affected properties have a matching Text
Style or Variable.
Matching a Text Style by font size does not guarantee the same font weight,
font family, line height, or other typography properties.

Use **Select** to locate the text layer, inspect the suggested style or Variable,
and manually apply a typographically suitable choice in Figma.

<a id="primitive-binding"></a>
### Direct primitive bindings

**Warning:** A layer property is bound directly to a `Primitive` Variable while
the available candidates include a higher-level role-based Variable.

The finding shows the Variable currently bound to the property with the
`Bound to` label.
It can then show:

- **Exact value match:** a higher-level Variable with the same value;
- **Closest value match:** a higher-level Variable within the matching
  tolerance;
- **No higher-level match found:** no suitable higher-level Variable was found.

Primitive Variables hold raw values.
Higher-level Variables express the role of the property and can support the
semantic modes used by that role.
The check does not report a direct Primitive binding when no higher-level
candidate is available.

An equal or close value does not prove semantic suitability.
Review the role of the property before replacing its current binding.

Use **Select** to locate the layer, review the current `Bound to` Variable and
the higher-level suggestion, then manually apply an appropriate role-based
Variable in Figma.

## Suggestions, coverage, and scores

Suggestions are taken from the open file:

- local colour Variables for fills and strokes;
- local number Variables whose scopes allow dimensions;
- local paint Styles with one solid paint;
- local Text Styles matched by font size.

### Suggestion labels

The Design tab uses these labels:

- `Exact match` for an exact color, spacing, radius, or other value match;
- `Closest match` for a value within the matching tolerance;
- `No match found` when no value match is available;
- `Exact font-size match` for an exact font-size match;
- `Closest font-size match` for a nearby font-size match;
- `No font-size match found` when no font-size match is available;
- `Bound to` for the Variable currently bound to a property;
- `Exact value match` for an exact higher-level match to a Primitive binding;
- `Closest value match` for a nearby higher-level match;
- `No higher-level match found` when no higher-level match is available.

These suggestions are recommendations, not automatic fixes.
The plugin does not change a layer's Variable or Style binding when it displays
a suggestion.

### Variable mode awareness

Variable suggestions are resolved for the effective modes of the audited layer.
This includes inherited modes and explicit mode overrides.
When a Variable alias crosses collections, the plugin follows the alias when
the required modes can be resolved.

A Variable candidate is considered only when its resolved mode context matches
the audited layer.
A Variable that matches only in another mode is not presented as a valid exact
match.
Local Paint Styles do not depend on Variable modes.
When the layer's mode information cannot be resolved, Variable recommendations
may be unavailable.

The **Token coverage** value is the share of audited properties bound to a
Variable or Style.
A property bound to a primitive Variable counts as covered, even though it can
still produce a primitive-binding finding.

Token Coverage is calculated as:

```text
floor(100 * boundProperties / auditedProperties)
```

Each warning group shows how many affected properties have a possible
replacement match.
This is not the number of properties automatically fixed.

### Manual workflow for warning groups

The warning cards do not display inline **FIX** instructions.
Use this workflow instead:

1. Expand the warning.
2. Review the affected property and its value.
3. Inspect the suggested replacement.
4. Use **Select** to locate the layer in Figma.
5. Manually apply an appropriate Variable or Style.
6. Run the audit again.

## Reading the results

The audit shows separate blocks for **Accessibility** and **Token usage** when
there is data for that category.
Each available block has a score and grade, or shows **N/A** when no automated
check can be evaluated.
Expand finding groups to review their details and affected layers or properties.

Each finding includes:

- the problem and severity;
- the number of affected layers or properties;
- the worst measured value;
- a suggestion label when a replacement is available;
- layer paths and values;
- **Select** to select and zoom to a layer in Figma.

## Scores

Accessibility uses this formula:

```text
Score = Passed / (Passed + Failed) * 100
```

**Passed** means an automated contrast check was successfully evaluated and met
the selected contrast threshold.

**Failed** means an automated contrast check was evaluated and fell below the
selected contrast threshold.

**Manual review** is excluded from the score. **N/A** is shown when no automated
checks could be evaluated.

The score is rounded to the nearest whole percentage. For example, `360`
passed, `46` failed, and `112` require manual review, so the score is
`360 / (360 + 46) * 100 = 89%`.

Token usage uses this formula:

```text
floor(100 x properties without findings / properties)
```

The score treats direct primitive bindings as findings when a higher-level
Variable exists.
It is different from token coverage, which counts every bound property.
Token Usage measures design-system usage and is not part of WCAG conformance.

Both scores use these Design Token Kit grades:

- A: `90` and above;
- B: `80` to `89`;
- C: `70` to `79`;
- D: `60` to `69`;
- F: below `60`.

These A-F grades are Design Token Kit ratings, not WCAG levels.
Neither score is a WCAG conformance level.
Only the contrast finding is a WCAG criterion.

## Limitations

Background detection uses layer geometry and fills rather than the rendered
image.
The following cases can produce an inaccurate background:

- text spans two backgrounds;
- parent opacity, blend modes, effects, masks, clipping, or rotation affect the
  rendered result;
- a shape's bounding box covers an area that its visible shape does not;
- text is placed over an image or gradient.

Library Variables are not suggested as replacements, although a layer already
bound to a library Variable counts as bound.
Suggestions are chosen by value, not by semantic meaning.
Two semantic Variables with the same value can therefore be equally valid
matches.
Text Styles are matched by font size alone.

The audit does not automatically determine whether arbitrary graphical elements
are significant, decorative, active, or inactive. It also does not check visible
focus states or touch-target size. Review these requirements separately.
