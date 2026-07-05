# Project Progress

## Current Milestone

Monorepo Editor MVP: local-first resume editor without AI generation.

## Decisions

- Keep the existing `apps/editor` package instead of migrating to `packages/editor`.
- Preserve `packages/shared` compatibility for the existing Nuxt portfolio by keeping `demoResume.sections`.
- Remove AI controls from the primary editor workspace for this MVP; AI code can remain unused for later milestones.

## Completed

- pnpm workspace foundation already exists.
- Shared resume schemas now include typed editable modules.
- Editor store owns module add, reorder, update, duplicate, remove, reset, and safe restore flows.
- Editor UI now has a material panel, draggable canvas, dynamic module registry, and editable MVP modules.
- MSW exposes deterministic mock resume data for the editor resume endpoint.
- Unit tests cover core store/module behavior.
- Playwright Chromium E2E now covers loading the editor, dragging every material type into the canvas, reordering modules, and localStorage restore after refresh.

## Remaining Risks

- Existing editor ECharts bundle warning is unrelated to the no-AI MVP but remains in the project.
- Existing Nuxt/Nitro production build warnings remain in the portfolio package.
- The editor package path differs from the original `packages/editor` request by deliberate decision.

## Validation Snapshot

- `pnpm install`: passed.
- `pnpm lint`: passed, with Node ESM/CJS experimental warning from tooling.
- `pnpm typecheck`: passed.
- `pnpm test:unit`: passed.
- `pnpm build`: passed, with existing editor chunk-size and Nuxt/Nitro dependency warnings.
- `pnpm test:e2e`: passed in Chromium, 2 tests.
- Browser drag smoke: all four material types drag into the canvas, modules reorder without duplicate ids, edited name restores after refresh.

## Last Updated

2026-07-05
