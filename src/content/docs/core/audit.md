---
title: Design Audit API
description: Audit token accessibility, readability, and token usage with the Core API.
section: Core API
order: 6
---

# Design Audit API

The Core API provides two families of design audit functions:

- accessibility and readability audits for text samples and token sources;
- token usage audits for properties that may be bound to Variables or Styles.

These APIs operate on data supplied by the caller.
Core does not read Figma layers automatically.

## TokenAuditor

Use `TokenAuditor` when the input is a token source.
It accepts DTCG JSON, HRDT YAML, and DESIGN.md sources through the same loader
used by the other Core APIs.

The first source is the base token set.
Each following source is a theme override that falls back to the base set.

```ts
import { TokenAuditor } from "@design-token-kit/core";

const auditor = new TokenAuditor({
  level: "AA",
  rules: ["text-contrast", "text-size", "line-height"],
  minFontSizePx: 12,
});

const result = await auditor.audit([
  "./tokens.json",
  "./tokens.dark.json",
]);

if (!result.ok) {
  for (const issue of result.issues) {
    console.error(issue.sourcePath, issue.message);
  }
  process.exitCode = 1;
} else {
  for (const finding of result.report.findings) {
    console.log(
      finding.id,
      finding.severity,
      finding.theme ?? "base",
      finding.message,
    );
  }

  for (const subject of result.report.unchecked) {
    console.log("not checked", subject.subjectId, subject.message);
  }

  const score = result.report.score;
  console.log(
    score === undefined
      ? "Score unavailable"
      : `Score ${score.score} (${score.grade})`,
  );
}
```

`audit()` reads each source, assembles the base and themes, samples the token
names, and applies the selected rules.
It returns an `AuditResult`:

- `{ ok: true, report, issues }` when the sources can be audited;
- `{ ok: false, issues }` when input errors prevent a report.

Warnings that do not prevent loading are available in `issues` on the success
branch.
Input errors are also returned as issues rather than being hidden in a partial
report.

### Audit an existing list

Use `auditList()` when the application already has a parsed `DtcgList`.
It does not read files or return loader diagnostics.

```ts
import {
  DtcgListLoader,
  TokenAuditor,
} from "@design-token-kit/core";

const list = await new DtcgListLoader().load([
  "./tokens.json",
  "./tokens.dark.json",
]);

const report = new TokenAuditor({ level: "AAA" }).auditList(list);
console.log(report.sampleCount, report.findings, report.unchecked);
```

If loading fails, `DtcgListLoader.load()` throws `TokenSyntaxError`.
Use `audit()` when a tagged result is more convenient for application error
handling.

### Rules and configuration

`AuditorOptions` combines source-loading options with the text audit options:

- `level` selects `"AA"` or `"AAA"` contrast thresholds.
- `rules` is an allow-list of `"text-contrast"`, `"text-size"`, and
  `"line-height"`.
- `minFontSizePx` defaults to `12`.
- `minBodyLineHeight` defaults to `1.3`.
- `headingSizePx` defaults to `18` and excludes text at or above that size from
  the body line-height rule.
- `schema` selects a built-in schema name or a schema directory.
- `inform` forces a `TokenFormat` instead of detecting each source.
- `scoreWeights` changes the error and warning penalties.

The built-in schema names are `"2025.10"` and
`"2025.10-design.md"`.
`TokenFormat.DTCG`, `TokenFormat.HRDT`, and `TokenFormat.DESIGN_MD` are the
public values for `inform`.

Use `listAuditRules()` to discover rule IDs and metadata.
`TokenAuditor.unknownRules()` reports requested rule IDs that are not declared
by the current Core version.

### Token samples and name inference

`TokenAuditor` uses `TokenTextSampler` internally.
The sampler creates color-pair samples and typography samples from token names.
Text names such as `text-*`, `foreground-*`, and `fg-*` are paired with
`background-*`, `bg-*`, `surface-*`, and `canvas-*` names in the same context.
`on-X` and `text-on-X` names target the matching background.
Inverse, disabled, inactive, and overlay cases follow the audit naming rules.

The component does not inspect rendered pixels.
The quality of the inferred relationships depends on the token naming scheme.

### Findings, unchecked subjects, and scores

`AuditReport` contains:

- `findings`, with errors before warnings;
- `unchecked`, for subjects that could not be evaluated reliably;
- `sampleCount`, counting generated color pairs and typography samples;
- `score`, which is absent when no sample can be checked.

The full accessibility and readability rules are:

- `text-contrast`, an error below WCAG AA and a warning for an AA-passing
  sample below AAA when `level` is `"AAA"`;
- `text-size`, a warning below `minFontSizePx`;
- `line-height`, a warning for body text below `minBodyLineHeight`.

The default TokenAuditor score is penalty-based:

```text
100 - 2 x errors - 0.1 x warnings
```

The result is rounded and clamped to zero.
Unchecked subjects do not affect the score.
Grades are `A` for 90 or more, `B` for 80-89, `C` for 70-79, `D` for 60-69,
and `F` below 60.

`scoreWeights` can change the two penalties:

```ts
const auditor = new TokenAuditor({
  scoreWeights: {
    error: 3,
    warning: 0.25,
  },
});
```

## Sample-based accessibility APIs

Use the sample APIs when another system has already identified the text and its
background.
The caller must provide the sample data.

### TextSample

`TextSample` is source-independent.
Its optional fields let each rule use only the information it needs:

- `id` and `label` identify the sample;
- `foreground` and `background` are sRGB colors with alpha;
- `fontSizePx`, `fontWeight`, and `lineHeight` describe typography;
- `manualReviewReason` explains why a person must review the sample;
- `colorProblem` explains why a color could not be read;
- `sourcePath`, `tokenPath`, and `theme` provide optional context.

### Full accessibility and readability audit

`auditTextSamples()` applies the selected accessibility and readability rules.
It returns `TextAuditResult` with `findings` and `unchecked` subjects.
It does not calculate a score.

```ts
import {
  auditTextSamples,
  type TextSample,
} from "@design-token-kit/core";

const samples: TextSample[] = [{
  id: "card-caption",
  label: "Card caption",
  foreground: { red: 0.2, green: 0.2, blue: 0.2, alpha: 1 },
  background: { red: 1, green: 1, blue: 1, alpha: 1 },
  fontSizePx: 12,
  fontWeight: 400,
  lineHeight: 1.3,
}];

const result = auditTextSamples(samples, {
  level: "AA",
  rules: ["text-contrast", "text-size", "line-height"],
});

console.log(result.findings, result.unchecked);
```

### Contrast-only audit

`auditTextContrastSamples()` runs only `text-contrast`.
It is useful when a caller needs an accessibility contrast score without the
readability heuristics.

```ts
import {
  auditTextContrastSamples,
  type TextSample,
} from "@design-token-kit/core";

const sample: TextSample = {
  id: "body-on-page",
  label: "Body text on page",
  foreground: { red: 0.1, green: 0.1, blue: 0.1, alpha: 1 },
  background: { red: 1, green: 1, blue: 1, alpha: 1 },
  fontSizePx: 16,
  fontWeight: 400,
};

const result = auditTextContrastSamples([sample], { level: "AAA" });
console.log(result.findings);
console.log(result.score.score, result.score.grade);
```

`ContrastAuditResult.score` reports:

- `evaluated`, the passed and failed automated checks;
- `passed` and `failed` counts;
- `manualReview`, for unchecked manual-review subjects;
- `skipped`, for samples without usable contrast inputs;
- `score` and `grade`, when at least one check was evaluated.

The contrast-only score is:

```text
round(100 x passed / (passed + failed))
```

Manual review and skipped samples are excluded from the denominator.
`computeContrastScore()` computes the same result when the caller already has
the four counts:

```ts
import { computeContrastScore } from "@design-token-kit/core";

const score = computeContrastScore(
  8, // passed
  2, // failed
  1, // manual review
  0, // skipped
);

console.log(score.score, score.grade, score.evaluated);
```

An automated pass is not a complete accessibility judgment.
A sample with `manualReviewReason`, an unreadable color, or a translucent
background is reported separately from evaluated failures.

## Token usage APIs

Use the token usage APIs when the caller has properties from a design or code
inspection and a list of candidate Variables or Styles.

### UsageSample and TokenCandidate

`UsageSample` describes one property:

- `property` is `"fill"`, `"stroke"`, `"corner-radius"`, `"gap"`,
  `"padding"`, or `"font-size"`;
- `value` is an sRGB color or a dimension in pixels;
- `binding` describes the Variable or Style currently used, when there is one;
- `variableModes` carries the effective mode map when it is known.

`TokenCandidate` describes a possible replacement.
It contains the candidate kind, name, resolved value, optional layer,
property restrictions, and effective variable modes.

The API does not discover these samples or candidates.
An adapter must provide them.

### Run a token usage audit

`auditUsageSamples()` applies two warning rules:

- `hardcoded-value` finds an unbound property and suggests an exact or close
  token value;
- `primitive-binding` finds a property bound to the lowest configured layer
  when a higher-layer candidate exists.

```ts
import {
  auditUsageSamples,
  type TokenCandidate,
  type UsageSample,
} from "@design-token-kit/core";

const modes = { "color-collection": "light-mode" };
const blue = {
  type: "color" as const,
  color: { red: 0.15, green: 0.29, blue: 0.97, alpha: 1 },
};

const samples: UsageSample[] = [{
  id: "button#fill",
  label: "Primary button",
  property: "fill",
  value: blue,
  binding: {
    kind: "variable",
    name: "primitive/color/brand/500",
    layer: "primitive",
  },
  variableModes: modes,
}];

const candidates: TokenCandidate[] = [{
  kind: "variable",
  name: "semantic/color/action-primary",
  layer: "semantic",
  value: blue,
  properties: ["fill"],
  variableModes: modes,
}];

const result = auditUsageSamples(samples, candidates, {
  rules: ["primitive-binding"],
});

console.log(result.findings);
console.log(result.coverage.percent, result.score?.score);
```

If `binding` is absent, the property is treated as hard-coded.
If it is bound to the lowest configured layer, the primitive-binding rule first
checks that a higher-layer candidate exists for the property.

Pass `rules` to select an allow-list.
Pass `layers` to change the lowest-to-highest layer order.
The default order is `primitive`, `semantic`, `component`.

### TokenMatcher

`TokenMatcher` finds the best candidate for a property and value:

```ts
import {
  TokenMatcher,
  type TokenCandidate,
  type UsageValue,
} from "@design-token-kit/core";

const value: UsageValue = {
  type: "dimension",
  px: 16,
};

const candidates: TokenCandidate[] = [{
  kind: "variable",
  name: "primitive/dimension/space-400",
  layer: "primitive",
  value,
  properties: ["gap"],
}];

const matcher = new TokenMatcher(candidates, {
  dimensionTolerancePx: 1,
});
const match = matcher.match("gap", value);

if (match !== undefined) {
  console.log(match.candidate.name, match.exact);
}
```

Colors match exactly by their formatted `#rrggbbaa` value.
Close color matches use Oklab distance and require an alpha difference of at
most `0.01`.
Dimensions match exactly when their pixel difference is below `0.005px`.
Close dimension matches use a `1px` tolerance by default.

The matcher ranks exact matches before close matches.
With the default layer order, it then prefers the semantic layer over the
lowest primitive layer, nearest value, and finally the candidate name.
Custom layer orders control the available layer ranking.
Candidates can restrict which properties they support.

For mode-aware matching, a variable candidate must have exactly the same
collection-to-mode map as the sample.
Candidates without modes match only samples without modes.
Styles are not filtered by variable modes.
Values in candidates must already be resolved for their mode context.

### Usage scores and coverage

`TokenUsageResult` contains findings, `coverage`, and an optional `score`.

`computeTokenCoverage(samples)` returns:

- `total`, the number of properties evaluated;
- `bound`, the number bound to a Variable or Style;
- `percent`, the bound share rounded down;
- `byProperty`, the same totals grouped by property.

Its coverage formula is:

```text
floor(100 x bound / total)
```

`computeTokenUsageScore(total, findings)` measures properties without findings:

```text
floor(100 x clean / total)
```

`clean` is the number of properties without a finding.
The score receives the same A-F grade ranges as the TokenAuditor score.

```ts
import {
  computeTokenCoverage,
  computeTokenUsageScore,
  type AuditFinding,
  type UsageSample,
} from "@design-token-kit/core";

const samples: UsageSample[] = [];
const findings: AuditFinding[] = [];
const coverage = computeTokenCoverage(samples);
const score = computeTokenUsageScore(samples.length, findings);

console.log(coverage.percent, score?.score, score?.grade);
```

When no properties can be evaluated, `total` and `bound` are zero,
`coverage.percent` is `undefined`, and the usage score is `undefined`.

Token Coverage and Token Usage Score are different metrics.
Coverage counts whether a property is bound at all.
Usage Score counts whether the property has no usage finding, so a direct
primitive binding can be covered but still lower the usage score.

## Compare the scoring models

These scores must not be compared as equivalent metrics:

- `TokenAuditor` audits token files, includes readability rules, and applies
  error and warning penalties.
- `auditTextContrastSamples()` evaluates caller-provided text/background
  samples and divides passed automated checks by evaluated checks.
  Manual review and skipped inputs are excluded.
- `auditUsageSamples()` evaluates caller-provided properties and scores the
  share without findings.
  It calculates bound-property coverage separately.

Each score describes a different population and purpose.

## Limitations

- Token-file auditing uses naming heuristics to infer text/background pairs.
- Token-file auditing does not inspect rendered interfaces or pixel geometry.
- Sample-based APIs depend on the accuracy and completeness of supplied data.
- An exact token-value match does not prove that the token is semantically
  suitable for the property.
- An automated contrast result does not prove full WCAG conformance.
- Core does not automatically read Figma layers or create audit samples from a
  Figma document.

Use the [Figma Design Audit](../../figma-plugin/design-audit/) documentation for
the plugin workflow that measures actual Figma layers.

## Related pages

- [Core API overview](../overview/)
- [Parse and load tokens](../parsing/)
- [Validate with the Core API](../validation/)
- [CLI design audit](../../cli/audit/)
- [Figma Design Audit](../../figma-plugin/design-audit/)
