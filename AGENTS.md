# AGENTS.md

## Project Overview

Warframe World State Timer is a Vue 3 + Vite + TypeScript app deployed to GitHub Pages.

## Package Manager

- Use `pnpm` only.
- The project package manager is pinned in `package.json`.
- Do not add Yarn, npm lockfiles, Yarn PnP files, or `.yarnrc.yml`.

## Runtime

- Node.js must satisfy the `engines.node` field in `package.json`.
- GitHub Actions should use the same major Node line as the project expects.

## Common Commands

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm type-check
pnpm verify:cycles
pnpm build
pnpm preview --host 127.0.0.1 --port 4173
```

Preview the production build at:

```text
http://127.0.0.1:4173/Warframe-World-State-Timer/
```

## TypeScript

- Keep TypeScript strict.
- Keep world-cycle domain types and logic in `src/domain/worldCycles/`.
- Keep world-cycle data contracts explicit before changing cycle mechanisms.
- Validate cycle changes with `pnpm test` and `pnpm verify:cycles`.
- Run `pnpm type-check` before considering TypeScript work complete.

## Frontend Notes

- Preserve the GitHub Pages base path in Vite config.
- Keep PWA generation working during build.
- After changes that affect routing, assets, or PWA behavior, verify the preview URL and key assets.

## Commit Readiness

Before committing, run:

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm type-check
pnpm verify:cycles
pnpm build
pnpm outdated --format json
git diff --check
```
