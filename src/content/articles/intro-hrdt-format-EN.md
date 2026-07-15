---
title: "HRDT YAML: a human-readable format for design tokens"
description: "Why HRDT YAML exists next to DTCG JSON and how it makes token files easier to read and edit by hand."
date: 2026-07-10
---

# HRDT YAML: a human-readable format for design tokens

Design tokens usually start with a nice idea: colors, spacing, radii, shadows - 
everything is stored in one place and describes the interface as a system. But 
when these tokens are written in detailed DTCG JSON, manual work with the file 
quickly becomes harder.

The problem is not DTCG itself. Its detail is useful: the format helps describe 
tokens in a strict and clear way. But the same detail becomes heavy when you need 
to open the file by hand, quickly look through it, understand the structure, add 
a new color, or fix a reference.

At this moment you see nested objects, service fields, `$type`, `$value`, 
`colorSpace`, `components`, arrays, curly braces inside curly braces, and then a 
few more braces on top. The format is still correct, but you do not really read 
it anymore. You decode it.

So we needed something more human-readable nearby. A format that describes the 
same tokens, but feels closer to how people work with them by hand. This is how 
we came to **HRDT YAML** - Human-Readable Design Tokens.

Why YAML? Because it works well for this task. It has less visual noise: you do 
not need to close every group with curly braces, watch commas after every field,
and move through long JSON objects. The structure is built with indentation, and 
the values read almost like a simple list.

This does not make YAML a magic format that solves all problems. But it solves 
one clear pain: the file becomes easier to open, read, and edit. It does not feel 
like you suddenly entered a technical scheme by mistake.

Of course, HRDT is not the only possible way to make tokens easier for manual work. 
There can be many such formats. Someone can choose another syntax, other short 
rules, or another file structure. We did not try to find one universal answer for 
everyone. We chose the option that fits our task: keep the connection with DTCG, 
but make the notation shorter and easier for people.

It is like a factory drawing for a cabinet. It shows the size of every part, the 
types of fasteners, the material, the order of connections, and even where each 
screw should go. This drawing is useful for production: for a machine, an engineer, 
or a quality control system. It is exact, detailed, and it does not have to be 
easy to read.

But when you need to assemble the cabinet by hand, you usually need another form 
of explanation. It is still correct, but more human: open the box, take the side 
panel, attach the shelf, do not mix up the top and bottom, and do not panic - 
the extra part is probably not extra.

HRDT is not a replacement for DTCG. It also does not try to say that the detailed 
format is no longer needed. HRDT is more like an assembly guide next to the factory 
drawing. It describes the same tokens, but closer to how a team usually thinks 
about them: first base values, then meaning, then usage in the interface.

For example:

```yaml
primitive:
  color:
    white: "#ffffff"
    brand-500: "#2549f6"

semantic:
  color:
    background-page: "{primitive.color.white}"
    action-primary: "{primitive.color.brand-500}"

component:
  button:
    primary:
      background: "{semantic.color.action-primary}"
```

In this example, it does not feel like a random pile of variables. The structure 
already shows how to read the file.

`primitive` is like the parts from the box. Base colors, sizes, radii, shadows. 
By themselves, they do not say much about the interface, but everything is built 
from them.

`semantic` is the purpose of these parts. A color is no longer just `#2549f6`. 
It becomes the main action. White is no longer just a value. It becomes the page 
background. This is where meaning appears.

`component` is the place where this meaning reaches a real interface element. 
For example, the primary button does not take the background directly from the 
palette. It uses a semantic role. Because of this, the component knows less about 
the internal details of the design system and uses its language instead.

The main goal of HRDT is to remove extra noise from manual work with tokens. 
When you need to read a file, discuss changes, or add a new value, a compact 
notation helps you not drown in technical fields.

At the same time, discipline does not disappear. HRDT still separates base values, 
semantic roles, and component settings. It does not turn tokens into a free YAML 
file where everyone writes as they want. The rules are still there. They are 
just visible through the structure, not through many service wrappers.

DTCG stays the detailed drawing. HRDT becomes a clear guide next to it.

Both describe the same cabinet. One format is needed so everything is exact inside. 
The other helps people work with it by hand.

There is also a practical part around HRDT: a tool for converting and working 
with this format. But that is another story - about how these files move from a 
human-readable notation to a result that can be used in a project.
