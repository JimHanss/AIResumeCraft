# AIResumeCraft

AIResumeCraft is a Yarn monorepo for a local-first resume editor MVP.

- `apps/editor`: Vue 3 + Vite + TypeScript visual resume editor.
- `apps/portfolio`: Nuxt 3 SSG portfolio site and Nitro BFF API.
- `packages/shared`: shared schemas, types, fixtures, and utilities.

## Editor MVP

The current editor milestone is intentionally no-AI. It supports:

- draggable resume materials,
- editable avatar, summary, education, experience, and grouped skills modules,
- dynamic module rendering on the canvas,
- module reordering from both the middle editor and right-side preview,
- Pinia state persisted to localStorage,
- Axios data access with optional MSW mock responses.

The editor remains in `apps/editor`. The `packages/shared` package preserves legacy `sections` data so the existing portfolio app can keep reading `demoResume.sections`.

## Development

```bash
yarn install
yarn dev:editor
yarn dev:portfolio
```

Enable browser-level mocks for the editor:

```bash
VITE_ENABLE_MSW=true yarn dev:editor
```

On Windows PowerShell:

```powershell
$env:VITE_ENABLE_MSW = "true"
yarn dev:editor
```

## Reset Local Data

Use the editor's reset button, or clear the persisted store manually:

```js
localStorage.removeItem('airesumecraft:resume-editor')
```

## Verification

```bash
yarn install --immutable
yarn lint
yarn typecheck
yarn test:unit
yarn test:e2e
yarn build
```

If Playwright browsers are not installed yet:

```bash
yarn playwright install chromium
```
