# Project Progress

## Current Status

The Monorepo Editor MVP is verified and complete. The repository now has a local-first, no-AI Vue editor with typed shared resume modules, Pinia persistence, MSW mock data, drag-and-drop canvas editing, unit coverage, and Chromium E2E coverage.

## Completed Features

### Monorepo Editor MVP

Status: Completed
Spec: `specs/monorepo-editor-mvp/spec.md`
Verify: `specs/monorepo-editor-mvp/verify.md`

Summary:

- Kept the existing `apps/editor` package location instead of migrating to `packages/editor`.
- Preserved `packages/shared` compatibility for the Nuxt portfolio by keeping legacy `sections` alongside new editable `modules`.
- Removed primary AI controls from the MVP editor workflow while leaving existing AI helper code available for later milestones.
- Added shared resume schemas, fixtures, API constants, and pure utilities for typed modules.
- Added a Pinia `useResumeStore` for initialization, module add/reorder/update/remove/duplicate/reset, selection, preferences, safe restore, and localStorage persistence.
- Added editor UI for a material panel, draggable canvas, module frame, dynamic module registry, and editable avatar, summary, experience, and skills modules.
- Added Axios-backed mockable resume data access and MSW handlers for deterministic demo resume data.
- Added unit and E2E coverage for store behavior, drag-and-drop, editing, and refresh persistence.

Validation:

- `pnpm install --frozen-lockfile`: passed.
- `pnpm lint`: passed after `pnpm lint:fix` applied mechanical style fixes.
- `pnpm typecheck`: passed.
- `pnpm test:unit`: passed, 9 tests.
- `pnpm build`: passed.
- `pnpm test:e2e`: passed in Chromium, 2 tests.
- `git diff --check`: passed.

Changed Areas:

- `packages/shared`: resume schemas, fixtures, API route constants, pure module helpers, and shared tests.
- `apps/editor`: store, API client/helper, MSW mocks, router, workspace layout, material/canvas/module components, module registry, styles, unit tests, and E2E tests.
- `apps/portfolio`: compatibility updates for shared resume model changes.
- Project docs and workflow files: `README.md`, `.gitignore`, `PROJECT_PROGRESS.md`, `CODE_MAP.md`, and `specs/monorepo-editor-mvp/*`.

## In Progress

- Feature: None.
- Current phase: Documentation and hygiene complete for `monorepo-editor-mvp`.
- Next step: Commit the verification/doc hygiene updates when ready.

## Known Risks

- Risk: The editor build still emits a large chunk warning because ECharts is bundled.
  Mitigation: Consider code-splitting chart code before production release gating.
- Risk: The portfolio build still emits Nuxt/Nitro dependency and Node deprecation warnings.
  Mitigation: Track during Nuxt/Nitro dependency updates.
- Risk: `pnpm lint` emits a Node experimental ESM/CJS warning from ESLint tooling.
  Mitigation: Treat as non-blocking unless future Node/tooling versions turn it into a failure.
- Risk: E2E can emit a non-fatal Vite ResizeObserver notification during drag-heavy tests.
  Mitigation: Current Playwright assertions pass; revisit only if it becomes test-failing noise.
- Risk: The editor package path differs from the original `packages/editor` request.
  Mitigation: This was an explicit MVP decision to keep the existing `apps/editor` workspace shape.

## Last Updated

2026-07-05
