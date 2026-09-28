/** A sample token document that visitors can load into the playground. */
export interface PlaygroundExample {
    readonly id: string;
    readonly label: string;
    readonly fileName: string;
    readonly inputFormat: 'dtcg' | 'hrdt' | 'design-md';
    readonly content: string;
}

const dtcg = {
    primitive: {
        color: {
            $type: 'color',
            'teal-600': { $value: { colorSpace: 'srgb', components: [0.039216, 0.372549, 0.34902], hex: '#0a5f59' } },
            'amber-500': { $value: { colorSpace: 'srgb', components: [0.960784, 0.619608, 0.043137], hex: '#f59e0b' } },
            'neutral-900': { $value: { colorSpace: 'srgb', components: [0.058824, 0.090196, 0.164706], hex: '#0f172a' } },
            white: { $value: { colorSpace: 'srgb', components: [1, 1, 1], hex: '#ffffff' } },
        },
        space: {
            $type: 'dimension',
            sm: { $value: { value: 8, unit: 'px' } },
            md: { $value: { value: 16, unit: 'px' } },
            lg: { $value: { value: 24, unit: 'px' } },
        },
        radius: {
            $type: 'dimension',
            md: { $value: { value: 14, unit: 'px' } },
        },
    },
    semantic: {
        color: {
            $type: 'color',
            accent: { $value: '{primitive.color.teal-600}' },
            highlight: { $value: '{primitive.color.amber-500}' },
            text: { $value: '{primitive.color.neutral-900}' },
            surface: { $value: '{primitive.color.white}' },
        },
        space: {
            $type: 'dimension',
            gap: { $value: '{primitive.space.md}' },
        },
    },
};

const hrdt = `primitive:
  color:
    teal-600: "#0a5f59"
    amber-500: "#f59e0b"
    neutral-900: "#0f172a"
    white: "#ffffff"
  dimension:
    space-sm: 8px
    space-md: 16px
semantic:
  color:
    accent: "{primitive.color.teal-600}"
    text: "{primitive.color.neutral-900}"
    surface: "{primitive.color.white}"
---
# A second document is a theme: dark mode overrides.
semantic:
  color:
    text: "{primitive.color.white}"
    surface: "{primitive.color.neutral-900}"
`;

const designMd = `---
name: Heritage
colors:
  primary: "#0a5f59"
  accent: "#f59e0b"
  ink: "#0f172a"
typography:
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
rounded:
  md: 14px
spacing:
  md: 16px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: 12px
---

## Overview

A calm, editorial palette with a teal primary color and warm accents.
`;

export const playgroundExamples: readonly PlaygroundExample[] = [
    { id: 'dtcg', label: 'DTCG JSON', fileName: 'tokens.json', inputFormat: 'dtcg', content: `${JSON.stringify(dtcg, null, 2)}\n` },
    { id: 'hrdt', label: 'HRDT YAML with a theme', fileName: 'tokens.yaml', inputFormat: 'hrdt', content: hrdt },
    { id: 'design-md', label: 'DESIGN.md', fileName: 'DESIGN.md', inputFormat: 'design-md', content: designMd },
];
