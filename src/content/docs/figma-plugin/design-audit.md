---
title: Design Audit
description: Check accessibility, readability, and token usage on the current page or entire Figma file.
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

The plugin audits visible text layers for contrast and readability.

<a id="text-contrast"></a>
### Text contrast is below WCAG AA

**Error:** The contrast ratio is below the WCAG AA minimum.

- Normal text needs at least `4.5:1`.
- Large text needs at least `3:1`.
  Large text is `24px` or larger, or `18.66px` or larger with a font weight of
  at least `700`.

The ratio is calculated from the text colour and the background found under the
centre of the text.

Fix it by using a darker text colour on light surfaces or a lighter colour on
dark surfaces.
A semantic text Variable is preferred when it is known to work on the surface.

<a id="text-size"></a>
### Text is smaller than 12px

**Warning:** The font size is below `12px`.
This is a readability guideline, not a WCAG minimum.

Fix it by applying a sufficiently large Text Style from the typography scale.

<a id="line-height"></a>
### Body text lines are too tight

**Warning:** Wrapped body text has a line height below `1.3` times the font
size.
Text at `18px` or larger is treated as heading text and is not checked by this
rule.

Fix it by increasing line height or applying a body Text Style.
Automatic line height is not audited because its value depends on the font.

<a id="text-contrast-unchecked"></a>
### Text contrast could not be evaluated

**Not checked:** The plugin cannot calculate a single contrast ratio when the
text or its background uses a gradient, image, video, pattern, mixed character
fills, or a translucent background without an opaque layer below it.

These layers do not affect the score.
Check them visually or put a solid fill behind the text.

## How the audit measures text

The text colour comes from the visible text fill.
Paint opacity and layer opacity are included.
Mixed character colours and gradients cannot be reduced to one text colour.

The background is read below the centre of the text:

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

The plugin audits the WCAG AA contrast criterion.
The accessibility score is not a WCAG conformance level.

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
### Values are not bound to variables

**Warning:** A property uses a hard-coded value instead of a Variable or Style.
The findings are grouped into:

- colours that are not bound to Variables;
- spacing and radii that are not bound to Variables;
- text without a Text Style or font-size Variable.

The plugin suggests an exact match first, then a close match.
Bind the property to the suggestion, round an unmatched value to a scale step,
or add the missing token to the design system.

Exact colour matches use the same `#rrggbbaa` value.
Close colour matches use an Oklab distance of at most `0.02`.
Dimension matches can differ by at most `1px`.

Only local Variables and Styles are suggested.

<a id="primitive-binding"></a>
### Layers use primitive variables directly

**Warning:** A property is bound to a `primitive` Variable even though the file
has semantic or component Variables.

Primitive Variables hold raw values and do not express the role of the
property.
They also do not follow a semantic mode that remaps that role.

Fix it by binding the suggested semantic Variable instead.
The check does not report a problem when the file contains only primitive
Variables.

## Suggestions and coverage

Suggestions are taken from the open file:

- local colour Variables for fills and strokes;
- local number Variables whose scopes allow dimensions;
- local paint Styles with one solid paint;
- local Text Styles matched by font size.

The **Token coverage** value is the share of audited properties bound to a
Variable or Style.
A property bound to a primitive Variable counts as covered, even though it can
still produce a primitive-binding finding.

## Reading the results

The audit shows separate blocks for **Accessibility** and **Token usage**.
Each block has a score and grade.
Findings can be filtered by **All**, **Errors**, **Warnings**, or **Not checked**.

Each finding includes:

- the problem and severity;
- the number of affected layers or properties;
- the worst measured value;
- a fix recommendation;
- layer paths and values;
- **Select** to select and zoom to a layer in Figma.

## Scores

Accessibility uses this formula:

```text
100 - 2 x errors - 0.1 x warnings
```

The score never goes below zero.
Contrast errors count as errors.
Small text and tight body text count as warnings.
Not-checked text does not affect the score.

Token usage uses this formula:

```text
100 x properties without findings / properties
```

The score treats direct primitive bindings as findings when a higher-level
Variable exists.
It is different from token coverage, which counts every bound property.

Both scores use these grades:

- A: `90` and above;
- B: `80` to `89`;
- C: `70` to `79`;
- D: `60` to `69`;
- F: below `60`.

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

The audit does not currently check icon and control contrast, visible focus
states, or touch-target size.
