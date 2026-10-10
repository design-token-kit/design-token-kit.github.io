# Contributing

Thank you for helping improve the Design Token Kit website.
Contributions are welcome through issues and pull requests.

## Before you start

- Read the [Code of Conduct](CODE_OF_CONDUCT.md).
- Search existing issues and pull requests before opening a new one.
- Use English for issues, pull requests, and repository documentation.

## Development setup

Requirements:

- Node.js 22.12.0 or newer
- npm compatible with the project lockfile and package metadata

Clone the repository and install dependencies:

```bash
git clone https://github.com/design-token-kit/design-token-kit.github.io.git
cd design-token-kit.github.io
npm install
```

Start the local development server:

```bash
npm run dev
```

The site is available at the local URL printed by Astro.

## Checks and builds

Run the checks that apply to your change before opening a pull request:

```bash
npm run check:import-case
npm run tokens:check
npm run lint:styles
npm run build
```

When token source files change, regenerate the CSS output when required:

```bash
npm run tokens:build
```

Do not commit local build output, credentials, or environment-specific files.

## Making changes

- Keep changes focused on one purpose.
- Follow the existing Astro, TypeScript, SCSS, and design-token patterns.
- Preserve responsive behavior and keyboard accessibility.
- Keep public-facing text clear and consistent with project terminology.
- Update documentation when a change affects setup, behavior, or usage.

## Pull requests

1. Create a branch from `main`.
2. Make the smallest complete change that solves the problem.
3. Run the relevant checks locally.
4. Open a pull request with a clear summary and validation notes.
5. Respond to review feedback and keep the branch up to date.

Pull requests should explain the user-visible effect of website changes.
Include screenshots for visual changes when they help reviewers.

## Commit messages

Use a short, clear, imperative commit subject.
Keep unrelated changes in separate commits when practical.

## Questions

For questions that are not security-sensitive, open a GitHub issue.
For security concerns, follow the process in [SECURITY.md](SECURITY.md).
