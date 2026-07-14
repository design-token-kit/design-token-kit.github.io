# Design Token Kit Website

Site: https://design-token-kit.github.io/

[![Astro](https://img.shields.io/badge/Astro-7.0.7-111827?style=flat-square)](https://astro.build/)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-2563eb?style=flat-square)](https://pages.github.com/)
[![Design Token Kit](https://img.shields.io/badge/Project-Design%20Token%20Kit-059669?style=flat-square)](https://github.com/design-token-kit/design-token-kit)

Astro site for Design Token Kit. The site presents the project, links to the
repository and npm package, and is published from this repository to GitHub
Pages.

- [Overview](#overview)
- [Structure](#structure)
- [Build](#build)
- [Publish](#publish)
- [Content](#content)

## Overview

This repository contains the public website for Design Token Kit.

The site is built with Astro and deployed to GitHub Pages at:

https://design-token-kit.github.io/

The current homepage presents the project as a small landing page with:

- project name and summary
- links to GitHub and npm
- a short capability overview: validate, convert, showcase

## Structure

- `src/pages/index.astro` - homepage route
- `src/components/HomePage/HomePage.astro` - homepage composition
- `src/components/HomePage/HomePage.module.scss` - homepage layout styles
- `src/components/*/*.astro` - reusable homepage sections and cards
- `src/layouts/Layout.astro` - shared document shell and metadata
- `public/` - static files copied to the final build
- `dist/` - generated build output, excluded from version control
- `.github/workflows/deploy.yml` - GitHub Pages deployment workflow

## Build

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Publish

The site is deployed through GitHub Pages using GitHub Actions.

Deployment flow:

```bash
git push origin main
```

After a push to `main`, GitHub Actions runs the deployment workflow in
`.github/workflows/deploy.yml`, builds the Astro site, uploads the generated
`dist/` directory, and publishes it to GitHub Pages.

Repository settings must use:

- `Settings -> Pages`
- `Source = GitHub Actions`

Because the repository is `design-token-kit.github.io`, the site is published
from the root URL and does not require an extra `base` path.

## Content

- Project homepage composition: `src/components/HomePage/HomePage.astro`
- Page entrypoint: `src/pages/index.astro`
- HTML metadata and favicon links: `src/layouts/Layout.astro`
