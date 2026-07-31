---
title: "Utility-First CSS. New Name, Old Problem"
description: "The industry spent twenty years moving away from inline styles for the sake of separation of concerns, then came back to them under the name of utility classes. The history of an anti-pattern and what to do about it."
date: 2026-07-28
category: CSS and Architecture
---

# Utility-First CSS. New Name, Old Problem

![Utility-First CSS. New Name, Old Problem](utility-classes-new-name-old-problem.jpg)

Inline styles have long been considered an anti-pattern. Every beginner guide says
it: don't write `style="color: red"`, move your styles into a separate file. And
yet almost every modern CSS framework offers utility classes like `text-red-500`
that do essentially the same thing: they push presentation back into the markup.

The observation isn't new. The argument that "utility classes are just inline
styles" is one of the most worn-out in the CSS community, and utility-first
defenders call it "the most tired, overused cliché." The debate usually stalls: one
side says "it's the same thing," the other lists technical differences, and there it
ends.

It's more interesting to look past the technical details, at the history. Because
the industry has already walked this path. It spent twenty years moving styles out
of markup, then moved them right back - it just gave them a different name. New
name, old problem.

## How We Moved Styles Out of Markup

In the early 2000s, styles lived directly in HTML. The `style` attribute, the
`<font>` tag, tables for layout, `bgcolor` and `align` on every element. Markup and
presentation were tangled together, and any change to appearance meant editing
hundreds of lines of HTML.

The turning point was Dave Shea's CSS Zen Garden in 2003. The idea was strikingly
simple: the exact same HTML, wildly different looks - only the linked CSS changes.
Out of this grew the rule that became gospel in frontend: separation of concerns.
HTML handles structure, CSS handles presentation, JavaScript handles behavior. Each
does its own job.

From that rule one thing followed directly: inline styles are bad. If presentation
lives in CSS, then `style="..."` in the markup crosses the line. The arguments were
solid:

- Styles can't be reused. Every element carries its own copy.
- No pseudo-classes, pseudo-elements, or media queries.
- No caching: the styles are baked into the HTML rather than a separate file.
- The markup is cluttered with presentation again, like in the nineties.

A whole generation of frontend developers learned this as an axiom. An inline style
in a code review was grounds to send the pull request back.

## How We Came Back

Then the story took an unexpected turn. As frontend grew more complex, "semantic"
CSS turned out to have a price of its own.

In 2012, Nicolas Gallagher wrote "About HTML semantics and front-end architecture."
The key point: semantic class names like `.author-bio` aren't all that useful to a
machine, and their main role is to be a hook for CSS and JavaScript. This line of
thinking led to OOCSS and then atomic CSS: many small classes, each doing one
thing.

In 2017, Adam Wathan took the idea to its logical conclusion in "CSS Utility
Classes and Separation of Concerns" - the article Tailwind grew out of. His
argument is subtler than it looks. Wathan says separation of concerns isn't a
yes-or-no question but a question of the direction of dependency:

- When CSS depends on HTML (semantic names: `.author-bio` knows about the page
  structure), HTML stays independent, but CSS becomes rigid and hard to reuse.
- When HTML depends on CSS (utility classes: the markup knows about the available
  set of classes), CSS becomes independent and reusable, but the HTML now has to
  know the set of utilities.

Wathan's conclusion: for most projects, reusable CSS is worth more than markup
that's easy to restyle. There's no arguing with the dependency-direction point. But
a second, weaker one rides along with it: the number of classes in semantic CSS
grows linearly with the number of components, and this is presented as a pain.

So the industry moved presentation back into the markup. Only now it isn't
`style="..."`, it's `class="text-red-500 p-4 flex"`. And it stopped being an
anti-pattern - it became best practice.

## Linear Growth Isn't a Pain, It's a Map of the Domain

The linear-growth argument is less convincing than it looks, though it's the usual
justification for abandoning names.

The number of component classes equals the number of meaningful components in the
system. `danger-button`, `primary-card`, `nav-link` - each exists because there's
such an entity in the domain. If there are a hundred of them, there are a hundred
distinct things in the system. The class names them honestly.

Hiding those meanings inside a pile of utility classes doesn't make the entities
fewer. The complexity doesn't go away - it scatters across the markup and turns
invisible. There's no less of it, only less transparency. And if there really are
too many classes, that's a diagnosis for the design: no reuse, a bloated component
system. The thing to fix is the design, not to hide the symptom in the markup.

Many classes aren't a pain, they're a map of the domain's complexity. If the map is
large, the territory is large. Burning the map doesn't shrink the territory.

CSS has real problems, and they shouldn't be confused with the imaginary one.
Specificity, the cascade, the `!important` war, names bound to the DOM structure -
that's the real pain. But it isn't about the "number of classes," it's about the
mechanics of CSS itself. Wathan blames that pain on the number of names and
prescribes a cure - remove the names. But the names were never what hurt. Removing
them won't cure the cascade. It'll only blind you: the map of the domain is
scattered across the markup.

## What's Really Different, and What Isn't

Let's be fair: utility classes are not literally inline styles. The differences
exist, and they're real:

- Constraints. An inline style allows any of 16 million color values. A utility set
  limits the choice to a dozen colors from a palette. In real codebases Wathan
  found 380+ text shades where the design intended about ten. The constraint is a
  feature.
- Pseudo-classes and media queries. `hover:bg-blue-600`, `md:flex` - an inline
  style simply can't do this.
- Reuse and caching. Classes are defined once in a shared stylesheet. CSS doesn't
  grow linearly with every new feature, and the file is cached by the browser.

So "it's literally the same thing" is inaccurate. But both approaches share one
much more important weakness, which even utility-first defenders admit.

Presentation lives in the markup again. Both `style="color: red; padding: 16px"`
and `class="text-red-500 p-4"` put presentation at the lowest possible level of
abstraction: one property, one entry, right on the element. When you need to change
the styling of a whole class of components, you have to edit every instance in the
markup. That's exactly the maintenance pain that got inline styles labeled an
anti-pattern in the first place.

## The Real Problem Is the Level of Abstraction

The "same thing or not" debate leads nowhere. The real problem isn't where
presentation physically sits - in the `style` attribute or the `class` attribute.
The real problem is the level of abstraction.

`text-red-500` answers the question "which color is this." It does not answer the
question "what is this color for." Is red the error color? The promo color? The
brand color? The class is silent. The meaning lives in the head of whoever wrote
it, not in the code.

As long as those two questions stay fused, any change hits both. Say you decide the
error color should be orange - now you have to find every `text-red-500` that meant
error, and leave the ones that meant something else alone. You can't tell them apart
from the code, because the code records the color, not the role.

This violates the single-level-of-abstraction principle. In one place - the markup -
high-level intent ("this action is the primary one") is mixed with a low-level
detail ("color 500 from the red scale"). Utility classes don't remove inline styles
as an anti-pattern. They cement it at the tooling level and give it a nice name.

## But What About the Long String of Classes? It's Still There

Here's an objection. Our danger-action button is
`class="size-big color-red padding-4"` - a string of utility classes with values
straight in the markup. Translate it to semantics:

```html
<button class="size-danger color-danger padding-danger">Delete</button>
```

Is this better? At first glance yes: roles instead of values. But the long class
list is still there, and on top of that these classes aren't reused - each lives
exactly once, while the `danger` combination is repeated on every danger-action
button. It's both verbose and impossible to reuse.

There's only one logical conclusion - collapse the combination into a single class:

```html
<button class="danger-button">Delete</button>
```

Now the class list is short. It was collapsed by a component class - one
semantic class in place of N utility classes. This is the very semantic CSS whose
class count grows with the number of components, and we've already established that
this isn't a pain but an honest map of the domain. The long class list is collapsed
by good markup design, and that settles the question.

## Separate Value from Role

Back to the real problem - the fusing of two questions. The component class shortened
the class list, but there's still CSS behind it, and it's there that those two
questions need to be separated. That's exactly what design tokens do, through their
hierarchy of levels:

- Primitives answer "which color is this": `red-500` is a concrete value from the
  palette, written down exactly once.
- Semantics answer "what for": `color-error` references a primitive. The role is
  separated from the value.
- The component level ties the role to where it's used:
  `button-danger-background` references a semantic.

The CSS of the component class now references tokens instead of hardcoding values:

```css
.danger-button {
  background: var(--component-button-danger-background);
  padding: var(--component-button-danger-padding);
  font-size: var(--component-button-danger-size);
}
```

Now "make the error color orange" is a single edit at the semantic or primitive
level, and it flows out to every place the role is used. There's no need to tell
"red as error" from "red as something else": they were separate roles from the
start.

The markup, meanwhile, carries only intent - `class="danger-button"` - not concrete
properties. Value and role are separated across the token levels. Each level of
abstraction is back in its place.

## Conclusion

Two things here are easy to conflate. On the surface, the circle has closed: we
moved away from `style="color: red"` for the sake of
separation of concerns, declared inline styles an anti-pattern - and came back to
the same thing under the name `class="text-red-500"`, declaring it best practice.
The name and the attribute changed, the place for presentation stayed the same - the
markup.

But in substance there's no circle, because there's nothing to close. The value sat
this whole time at the lowest level of abstraction, where "which color" and "what
for" are fused into one. `style=` didn't solve that, `text-red-500` doesn't solve
it. For twenty years we've stood on the same level, and each new name passed that
off as progress. New name, old problem.

Utility classes are not literally inline styles; they have real advantages:
constraints, pseudo-classes, caching. But they don't cure the old problem - they
cement it. And the promised escape from "linear class growth" turns out to be not a
cure but blindness: the map of a complex domain is scattered across the markup, and
the entities don't get any fewer.

The way out isn't to choose between two ways of keeping color in the markup. The way
out is to give each level of abstraction its own place. The component class shortens
the class list and honestly names the domain entity. The tokens beneath it separate
value from role. Only then do we finally step off the plateau: the markup starts to
speak of intent again, not of pixels.

## Links

- [CSS Zen Garden](http://www.csszengarden.com/)
- [About HTML semantics and front-end architecture - Nicolas Gallagher](https://nicolasgallagher.com/about-html-semantics-front-end-architecture/)
- [CSS Utility Classes and "Separation of Concerns" - Adam Wathan](https://adamwathan.me/css-utility-classes-and-separation-of-concerns/)
- [No, Utility Classes Aren't the Same As Inline Styles - frontstuff](https://frontstuff.io/no-utility-classes-arent-the-same-as-inline-styles)
- [If we're gonna criticize utility-class frameworks, let's be fair about it - CSS-Tricks](https://css-tricks.com/if-were-gonna-criticize-utility-class-frameworks-lets-be-fair-about-it/)
- [Design Token Kit on GitHub](https://github.com/design-token-kit/design-token-kit)
