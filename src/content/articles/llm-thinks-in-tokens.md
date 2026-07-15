---
title: "An LLM Thinks in Tokens"
description: "Why design tokens give language models a clearer and more consistent way to understand, generate, and maintain design than screenshots or raw CSS."
date: 2026-07-01
category: AI and Design Tokens
---

# LLM Thinks in Tokens

![An LLM Thinks in Tokens](LLM-Thinks-Tokens.jpg)

When a person looks at an interface, they see an image: buttons, spacing, colors,
and the overall mood of the layout. We rarely think about it: perceiving design
through a picture feels completely natural.

A language model has no such channel. It never looks at a screen. And that
changes almost everything about how you should feed it a design.

## Everything Becomes Numbers

It is tempting to think that modern multimodal models solve the problem: since
they can work with images, you could just give the model a screenshot and it
would see the design the way a human does.

But multimodality is beside the point. Whatever you feed the model, text, image,
or sound, becomes numbers on the inside. The model never handles a picture as a
picture. It handles a numeric representation of one.

So the question isn't whether the model "sees" the design. It's which numeric
representation the model ends up with.

And this is where a screenshot falls short. An image becomes numbers that describe
pixels: lighter here, darker there, an edge over here. From that, the model can
roughly guess that the spacing is around sixteen pixels and the color is some kind
of blue. But that's guesswork from a picture, not knowledge of the design.

## Which Numbers, Exactly

The difference is roughly like the difference between a photo of a book page and
the text of the book itself.

The text is in the photo too. But to use it, you first have to recognize the
letters, piece the words back together, and work out where a paragraph starts and
where that's just a shadow on the page. Working with the text directly skips all
of that guesswork.

Design works the same way. A screenshot, or even HTML with styles, makes the model
reconstruct intent from form. But you can give it the intent directly, spelled
out. That's what design tokens do.

A design token isn't a pixel or a line of CSS. It's a meaningful value with a
name: the primary action color, the surface background, the padding inside a card,
the corner radius of a panel. Tokens describe design the way a team talks about
it: not "this blue right here," but "the primary action color, used everywhere
there's a primary action."

As it happens, a language model's basic unit is also called a token. They're not
the same thing: a model token is a chunk of text, a design token is a named design
value. But they meet at the same point. Both are about turning meaning into a
structure a machine can work with.

## Why HTML and CSS Are Noise

You might object: HTML and CSS are text too, and the model reads them just fine.
It does. The problem isn't that the model can't understand CSS. The problem is
that HTML and CSS are full of things that have nothing to do with design.

Markup, nesting, utility classes, layout wrappers, color values copied from a
mockup by hand over and over. The design is in there, but it's buried in noise. To
work out that the same color in three different places is one and the same
"primary color," the model has to guess all over again.

Tokens clear that noise away. What's left is just the design and the relationships
between its parts, and the model no longer has to reconstruct anything.

## The Experiment: One Task, Two Paths

Rather than argue in the abstract, we ran a small blind experiment.

We gave the task to several independent agents running on the same model, split
into two groups. The design task was the same for everyone: build a product card.
Only the prompt differed.

The first group got a straight assignment:

```
Create a product card with an image, title, price, rating and a buy button.
Return the HTML and a separate CSS file.
```

The second group got the exact same task, with one requirement added on top:
describe the design in tokens first.

```
Create a product card with an image, title, price, rating and a buy button.
Return the HTML and a separate CSS file.

Before writing the CSS, define design tokens in the DTCG format in three layers:
primitive (raw values), semantic (roles referencing primitives), and component
(component values referencing semantics). The component styles must reference
the tokens and must not hardcode values.
```

Nothing else differed between the groups. Neither group knew about the other
approach or that the results would be compared. The difference was exactly one
thing: whether the model had to build a design vocabulary first or could jump
straight to markup.

### Path One: Straight to HTML and CSS

The first observation caught us off guard. Even in direct mode, a modern model
doesn't write colors straight into properties. It pulls the values out into CSS
variables on its own:

```css
:root {
  --color-surface: #ffffff;
  --color-accent: #4f46e5;
  --color-accent-hover: #4338ca;
  --radius-lg: 18px;
  --radius-md: 12px;
  --shadow-card: 0 10px 30px rgba(17, 24, 39, 0.08);
}
```

So the model largely settles the "variables versus magic numbers" debate by
itself. But look closer and you can see where the direct approach still comes up
short.

First, each variable does double duty. `--color-accent` is both a specific color
from the palette and the "primary action" role. A single name answers two separate
questions: "which color is this" and "what is it for." While those questions stay
fused, you can't answer one without disturbing the other. Change the brand color
in the palette, and you change the role along with it. Reassign the role to a
different color, and you're back editing the same name. And nothing in the code
tells you that a color and its hover variant are one brand color and its shade;
that link lives only in the head of whoever wrote it.

Second, some values still ended up hardcoded in the components: a `border-radius:
12px` sitting next to a radius variable here, an `outline` with a color written as
a standalone `rgba(...)` that ties back to nothing there.

Third, and this is the big one: the independent runs didn't line up. Different
variable names (`--color-accent` versus `--color-primary`), different radii (18px
versus 16px), one generation added a button shadow and the others didn't. Each
agent reinvented its own vocabulary. No shared language emerged.

### Path Two: Tokens First

The second mode looks different. The component styles hold no raw values at all,
only references to tokens:

```css
.card {
  background: var(--component-card-default-background);
  border-radius: var(--component-card-default-radius);
  box-shadow: var(--component-card-default-shadow);
}

.card__price {
  color: var(--component-card-price-color);
}

.card__button {
  background: var(--component-card-button-background);
}

.card__button:hover {
  background: var(--component-card-button-background-hover);
}
```

Behind those names sits a structure that pulls apart the two questions the direct
version fused together. "Which color is this" lives in the primitives. "What is it
for" lives in the semantics. A raw value shows up exactly once, in the primitives,
and everything after that is references:

```json
{
  "primitive": {
    "color": {
      "indigo-600": {
        "$type": "color",
        "$value": { "colorSpace": "srgb", "components": [0.31, 0.275, 0.898], "hex": "#4f46e5" }
      },
      "indigo-500": {
        "$type": "color",
        "$value": { "colorSpace": "srgb", "components": [0.388, 0.4, 0.945], "hex": "#6366f1" }
      }
    }
  },
  "semantic": {
    "color": {
      "action-primary": { "$type": "color", "$value": "{primitive.color.indigo-600}" },
      "action-primary-hover": { "$type": "color", "$value": "{primitive.color.indigo-500}" }
    }
  },
  "component": {
    "button": {
      "primary": {
        "background": { "$type": "color", "$value": "{semantic.color.action-primary}" },
        "background-hover": { "$type": "color", "$value": "{semantic.color.action-primary-hover}" }
      }
    }
  }
}
```

The format is explicit and unambiguous: every token states its type, and a
reference to another token is plain to both a human and a tool. The model parses a
format like this without misreading it, because there's nothing left to guess.

But the individual file isn't the interesting part; what happened across the
independent runs is. Every agent in this mode built almost the same structure.
Three levels: `primitive`, `semantic`, `component`. The same roles: `surface` for
the background, `action` for the primary action, `text-primary` and
`text-secondary` for text, `rating` for the rating. Different palettes, but the
same skeleton.

Different agents, the same task, and out came a consistent design vocabulary. The
direct mode never got there.

### What the Experiment Showed

The experiment didn't measure whether the card comes out "prettier." All the
variants look fine. It measured something else: how steadily and consistently the
model describes the design.

In direct mode the model pulls values into variables, but a variable name carries
the color and its role together, and the vocabulary comes out different every run.
In token mode color and role sit on separate levels, the component has no raw
values, and independent runs converge on one vocabulary.

The reason is the one already covered above. Tokens hand the model a way to think:
base values first, then roles, then usage. That's closer to how the model works
with data anyway, so the results come out more predictable.

There's one more takeaway, about the format. The model builds the structure with
confidence, but it slips on the fine points of DTCG itself. Not one token run was
valid on the first try: in one, dimensions were written as a string instead of a
value-and-unit pair; in another, the primitive groups weren't grouped by type.
But that's precisely the kind of problem tooling handles (see
[Design Token Kit](#design-token-kit)).

## The Design Lifecycle: With and Without Tokens

The difference doesn't show up at one moment; it runs through the whole life of a
design.

Creating. Without tokens, the model scatters values through the code, or through a
list of variables where color and role are fused, and it drifts out of sync from
one run to the next. With tokens it sets up a design vocabulary first and then
draws on it, so decisions get reused instead of reinvented.

Changing. Without tokens, "make the brand color darker" becomes a hunt across the
whole project. With tokens it's one line in the primitives, and the change flows
out to every place that references it.

Theming. Without tokens, a dark theme is often written almost from scratch. With
tokens a theme is just a different set of values for the same roles, and the
structure stays put.

Checking. Without tokens, it's hard even to say what counts as an error. With
tokens the rules are clear: a reference points nowhere, a type doesn't match, a
component reaches straight into a primitive and skips the semantics. All of that
can be checked automatically.

At every stage tokens give the model the same thing: an explicit structure instead
of a guess from form.

## Token Formats

The same tokens can be written in more than one format. They don't differ in
meaning, only in what the notation is optimized for.

DTCG (Design Tokens Community Group) is developed by the group of the same name at
the W3C as an industry standard for describing tokens. It's already the de facto
reference, even though work on the spec is still underway. Its main purpose is
interoperability: the same tokens should be understood by different tools, and
themes should be buildable on top of them. As the format's site puts it, DTCG JSON
unlocks interoperability and theming between tools. That makes it a common
language, a design written in DTCG moves between editors, build steps, and
documentation without being rewritten. This is the format we gave the model in the
experiment.

HRDT (Human-Readable Design Tokens) comes from the authors of design-token-kit, a
more readable way to write the same tokens in YAML by hand. It's more compact than
DTCG and round-trips to it without loss, so you can edit in YAML and still move
tokens between tools in shared DTCG.

DESIGN.md comes from Google: Markdown with tokens in the YAML frontmatter, which
design-token-kit supports. It covers a subset of a design (colors, typography,
spacing, corner radii, components) and works well for keeping a short description
of the system next to the docs. Richer types, such as shadows and gradients, fall
outside it.

<a id="design-token-kit"></a>
## design-token-kit

Working with tokens is more than writing them: you have to check the structure,
catch broken references, turn tokens into CSS, and see the result.
[Design Token Kit](https://github.com/design-token-kit/design-token-kit) handles all
of that.

It checks tokens, converts them, and builds a showcase. The DTCG tokens from the
experiment are what we ran through it.

Checking tokens:

```bash
dtokens check tokens.json
```

Converting to CSS:

```bash
dtokens convert --outform css --out tokens.css tokens.json
```

Generating a showcase page:

```bash
dtokens showcase --out showcase.html tokens.json
```

Converting between formats:

```bash
dtokens convert --inform dtcg --outform hrdt --out tokens.yaml tokens.json
```

## Conclusion

A person takes in design through an image. A model takes it in through numbers, and
the only question is how meaningful those numbers are.

A screenshot, or even clean CSS, hands the model a design where the value and its
meaning are fused and the links live only in the author's head. Design tokens hand
it a structure instead: value on one side, role on the other, explicit references
between them. In that form the model describes design far more consistently, which
is what the experiment showed.

Design tokens aren't just for people. They turn out to be a good fit for the model
too. And Design Token Kit makes that language easy to speak, without the busywork.

## Links

- [DTCG - Design Tokens Community Group](https://www.designtokens.org/)
- [DESIGN.md - a format from Google](https://github.com/google-labs-code/design.md)
- [Design Token Kit on GitHub](https://github.com/design-token-kit/design-token-kit)
