# AIResumeCraft

AIResumeCraft is a Yarn monorepo for a local-first resume editor MVP.

- `apps/editor`: Vue 3 + Vite + TypeScript visual resume editor.
- `apps/portfolio`: Nuxt 3 SSG portfolio site and Nitro BFF API.
- `packages/shared`: shared schemas, types, fixtures, and utilities.

## Editor MVP

The current editor milestone is intentionally no-AI. It supports:

- draggable resume materials,
- editable avatar, summary, education, experience, and grouped skills modules,
- custom modules with text, textarea, list fields, and responsive grid widths,
- dynamic module rendering on the canvas,
- module reordering from both the middle editor and right-side preview,
- preview theme switching with three resume styles,
- persisted typography and export preferences,
- undo and redo for local editing sessions,
- A4 PDF export with standard and high quality options,
- sticky header score visibility and a simulated score radar below the module selector,
- Pinia state persisted to localStorage,
- Axios data access with optional MSW mock responses.

The editor remains in `apps/editor`. The `packages/shared` package preserves legacy `sections` data so the existing portfolio app can keep reading `demoResume.sections`.

## Development

```bash
yarn install
yarn dev:editor
yarn dev:portfolio
```

This repo is pinned to Yarn 4 through Corepack. On machines that do not already
activate the pinned Yarn release, use:

```bash
corepack enable
corepack yarn install
corepack yarn dev:editor
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

## Editor Workflows

- Use the preview toolbar to switch resume themes, font family, font size, line height, accent color, and PDF export quality.
- Use the left-side `添加模块` / `Add module` button to create custom modules with configurable fields and list sections.
- Use the workspace history controls to undo and redo local content, ordering, locale, and preview preference changes.
- Use `导出 PDF` / `Export PDF` to export only the preview paper as an A4 portrait PDF.
- The header score and left-side score radar use deterministic mock data from the shared demo resume and do not call an AI service.

## Verification

```bash
yarn install --immutable
yarn lint
yarn typecheck
yarn test:unit
yarn test:e2e
yarn build
git diff --check
```

If Playwright browsers are not installed yet:

```bash
yarn playwright install chromium
```
