---
title: Audit design tokens
description: Analyze token files for text contrast and readability from the command line.
section: CLI
order: 5
---

# Audit design tokens

Use `dtokens audit` to analyze the design quality described by token files.
The command checks text contrast, readable font sizes, and body text line
heights.

```bash
dtokens audit tokens.json
```

The audit reads token data rather than a rendered design.
It infers text and background relationships from token names and evaluates the
base token set and its theme overrides.

## Supported input

The command accepts these token formats:

- DTCG JSON;
- HRDT YAML;
- DESIGN.md.

Input format is detected automatically for each source.
Use `--inform` to force one format for all sources.

```bash
dtokens audit tokens.json
dtokens audit tokens.yaml --inform hrdt
dtokens audit DESIGN.md --inform design-md
```

The command also accepts the CLI source forms supported by the token readers,
including local paths, URLs, raw `content:` values, and standard input.

## Base tokens and themes

The first source is the base token set.
Every following source is a theme override that falls back to the base set.

```bash
dtokens audit tokens.json tokens.dark.json
```

The base set and each theme are sampled separately.
A theme sample that is identical to a base sample is removed, so a theme
reports only the pairs and typography values it changes.

Theme names are taken from the source names when they are available.
The source position is used when a source does not provide a theme name, such
as standard input.

You can mix formats when they are auto-detected:

```bash
dtokens audit tokens.json tokens.dark.yaml
```

## Read from standard input

Pass `-` as a source, or omit source arguments when standard input is the only
source.

```bash
cat tokens.json | dtokens audit -
cat tokens.json | dtokens audit
```

Standard input can also be the base source followed by a theme file:

```bash
cat tokens.json | dtokens audit - tokens.dark.yaml
```

## Audit rules

All audit rules run by default.
Use `--rules` with a comma-separated allow-list to select rules.

```bash
dtokens audit tokens.json --rules text-contrast
dtokens audit tokens.json --rules text-size,line-height
```

The supported rules are:

- `text-contrast` reports an error when text is below the WCAG contrast
  minimum.
- `text-size` reports a warning when a typography token is smaller than the
  configured readable minimum.
- `line-height` reports a warning when body text has a line height below the
  configured readable minimum.

Run the command help to list rule IDs, categories, severities, and descriptions:

```bash
dtokens audit --help
```

Unknown IDs in `--rules` are reported as warnings and skipped.

## Text contrast

The default contrast level is WCAG 2.2 AA.

```bash
dtokens audit tokens.json --level AA
dtokens audit tokens.json --level AAA
```

The contrast thresholds are:

- AA normal text: `4.5:1`;
- AA large text: `3:1`;
- AAA normal text: `7:1`;
- AAA large text: `4.5:1`.

Text counts as large when it is at least `24px`, or at least `18.66px` with a
font weight of `700` or more.
When the font size is unknown, the stricter normal-text threshold is used.

With `--level AAA`, a contrast failure below AA remains an error.
A pair that passes AA but fails AAA is reported as a warning.

Translucent text is composited over its background before the ratio is measured.
A translucent background is not evaluated because its contrast depends on what
lies behind it.

## Pairing text and backgrounds

Token files do not describe which text color belongs on which background.
The audit infers that relationship from token names.

Text colors use `text-*`, `foreground-*`, or `fg-*` names.
The same words are also recognized at the end of a multi-word segment and in a
`text` group.
Background colors use `background-*`, `bg-*`, `surface-*`, or `canvas-*` names.
Pairs must be in the same naming context.

For example, these tokens are paired:

```text
semantic.color.text-primary
semantic.color.background-canvas
```

Component tokens can be paired in the same way:

```text
component.button.primary.text
component.button.primary.background-hover
```

An `on-X` or `text-on-X` color is paired only with the background named `X`.
That background is not paired with other text colors.
Inverse colors are paired only with other inverse colors.
Colors containing `disabled` or `inactive` are skipped.
Backgrounds containing `overlay`, `scrim`, or `backdrop` are also skipped.

When a naming context contains a typography token, the smallest available font
size and its weight determine whether its color pairs use the normal or large
text contrast threshold.

## Readability rules

### Minimum font size

`text-size` reports a warning when a typography token is smaller than the
configured minimum.
The default is `12px`.

```bash
dtokens audit tokens.json --min-font-size 14
```

This is a readability heuristic.
WCAG does not define a minimum font size.

### Body line height

`line-height` reports a warning when body text has a line-height multiplier below
`1.3` by default.
The rule applies to text below `18px`.
Text at or above `18px` is treated as heading text and is not checked by this
rule.

The CLI currently exposes `--min-font-size` but does not expose options for the
body line-height or heading-size thresholds.

## Findings and unchecked results

Findings are printed with the rule ID, severity, source, and message.
Errors and warnings are printed separately from the final audit summary.

```text
[text-contrast] error: tokens.json - semantic.color.text-tertiary on semantic.color.background-canvas: contrast 2.49:1 (#a1a4aa on #ffffff) is below 4.5:1, the WCAG AA minimum for normal text.
[text-size] warning: tokens.json - primitive.typography.caption: font size 10px is below the 12px minimum for readable text.
```

An unchecked result means that the audit was asked to evaluate a subject but
could not do so reliably.
Examples include an unsupported color without a usable hex fallback, an
unresolved color, or a translucent background.
Unchecked results are printed separately:

```text
[text-contrast] not checked: tokens.json - semantic.color.text-primary on semantic.color.background-overlay: the background is translucent (alpha 0.4), so the contrast depends on what lies behind it.
```

Unchecked results do not count as errors or warnings and do not reduce the
score.
Input warnings are printed before audit findings.
Input errors prevent a report from being produced.

## Score and grade

The audit score is calculated from findings that were checked:

```text
100 - 2 x errors - 0.1 x warnings
```

The result is rounded to the nearest integer and never goes below `0`.
Unchecked results do not enter the formula.

Grades use these ranges:

- `A`: `90` and above;
- `B`: `80` to `89`;
- `C`: `70` to `79`;
- `D`: `60` to `69`;
- `F`: below `60`.

The summary includes the number of errors, warnings, unchecked results, and
samples:

```text
Audit: 1 error, 1 warning, 1 not checked in 5 samples. Score 98 (A).
```

If no sample can be checked, the score is unavailable.

## CLI options

The audit command supports these options:

- `--level <level>` selects `AA` or `AAA` text contrast.
- `--rules <ids>` selects a comma-separated allow-list of audit rules.
- `--min-font-size <px>` sets the smallest readable font size.
- `--schema <path>` selects a schema directory or a built-in schema name.
- `-i, --inform [format]` forces `dtcg`, `hrdt`, or `design-md` input.

The built-in schema names are `2025.10` and `2025.10-design.md`.
The default schema is `2025.10`.

```bash
dtokens audit tokens.json --schema 2025.10
dtokens audit DESIGN.md --schema 2025.10-design.md --inform design-md
dtokens audit tokens.yaml --inform hrdt --min-font-size 14
```

## Exit status

The command uses these exit codes:

- `0` when the sources are readable and no error findings exist;
- `1` for an unexpected failure;
- `2` when input errors or audit errors are found.

Warnings and unchecked results do not by themselves produce a non-zero exit
status.

## CLI audit and Figma Design Audit

The CLI audit and the Figma Design Audit answer related but different questions.

The CLI audit:

- analyzes token files;
- infers text and background relationships from token names;
- includes readability rules for font size and body line height;
- uses the penalty-based score described above.

The [Figma Design Audit](../../figma-plugin/design-audit/) instead:

- analyzes actual Figma layers on the current page or in the entire file;
- measures text contrast against a sampled background under the text;
- reports accessibility and token usage as separate scores;
- uses different scoring formulas for those results.

Neither approach guarantees full WCAG conformance.
Token names cannot describe every rendered relationship, and a Figma audit
cannot verify every requirement from a design file alone.

## Related pages

- [Getting started](../../getting-started/)
- [Validate tokens](../validate/)
- [Generate token statistics](../stats/)
- [Core Design Audit API](../../core/audit/)
- [Figma Design Audit](../../figma-plugin/design-audit/)
- [DTCG JSON](../../formats/dtcg/)
- [HRDT YAML](../../formats/hrdt/)
- [DESIGN.md](../../formats/design-md/)
