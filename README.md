# AIResumeCraft

AIResumeCraft is initialized as a pnpm monorepo with:

- `apps/editor`: Vue 3 + Vite + TypeScript resume editor SPA.
- `apps/portfolio`: Nuxt 3 SSG portfolio site and Nitro BFF API.
- `packages/shared`: shared schemas, types, fixtures, and utilities.

## Development

```bash
pnpm install
pnpm dev:editor
pnpm dev:portfolio
```

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm build
```

Run E2E after installing Playwright browsers:

```bash
pnpm exec playwright install
pnpm test:e2e
```
