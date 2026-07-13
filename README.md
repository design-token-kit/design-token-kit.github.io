# design-token-kit.github.io

Astro site for Design Token Kit, intended to be published from this repository at
`https://design-token-kit.github.io/`.

## Structure

- `src/` - Astro pages, layouts, components, and local assets
- `public/` - static files copied as-is to the final site
- `dist/` - generated build output, excluded from version control

## Commands

Run all commands from the repository root:

| Command | Action |
| :-- | :-- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the local dev server |
| `npm run build` | Build the site into `dist/` |
| `npm run preview` | Preview the production build |

## Deployment

Configure GitHub Pages from this repository. Because this repository is
`design-token-kit.github.io`, the site is expected to publish from the root URL
without an extra `base` path.
