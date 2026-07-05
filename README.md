# AIResumeCraft

AIResumeCraft is a pnpm monorepo for a local-first resume editor MVP.

- `apps/editor`: Vue 3 + Vite + TypeScript visual resume editor.
- `apps/portfolio`: Nuxt 3 SSG portfolio site and Nitro BFF API.
- `packages/shared`: shared schemas, types, fixtures, and utilities.

## Editor MVP

The current editor milestone is intentionally no-AI. It supports:

- draggable resume materials,
- editable avatar, summary, experience, and skills modules,
- dynamic module rendering on the canvas,
- Pinia state persisted to localStorage,
- Axios data access with optional MSW mock responses.

The editor remains in `apps/editor`. The `packages/shared` package preserves legacy `sections` data so the existing portfolio app can keep reading `demoResume.sections`.

## Development

```bash
pnpm install
pnpm dev:editor
pnpm dev:portfolio
```

Enable browser-level mocks for the editor:

```bash
VITE_ENABLE_MSW=true pnpm dev:editor
```

On Windows PowerShell:

```powershell
$env:VITE_ENABLE_MSW = "true"
pnpm dev:editor
```

## Reset Local Data

Use the editor's reset button, or clear the persisted store manually:

```js
localStorage.removeItem('airesumecraft:resume-editor')
```

## Verification

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm build
```

Run E2E after installing Playwright browsers:

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```
