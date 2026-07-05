# Project Progress

## Current Status

The Monorepo Editor MVP and resume editor core enhancements are verified, documented, and complete. The repository now has a local-first, no-AI Vue editor with typed shared resume modules, Pinia persistence, MSW mock data, drag-and-drop canvas editing, right-side preview reordering, unit coverage, and Chromium E2E coverage.

## Completed Features

### Resume Editor Core Enhancements

Status: Completed
Spec: `specs/resume-editor-core-enhancements/spec.md`
Tasks: `specs/resume-editor-core-enhancements/tasks.md`
Verify: `specs/resume-editor-core-enhancements/verify.md`

Summary:

- Added an education resume module with school, degree, field of study, location, dates, GPA, honors, coursework, and description fields.
- Migrated core editor modules to reusable title-and-input field components.
- Expanded avatar and experience data with profile URL, location, and current-role semantics.
- Replaced flat skills with grouped skill editing and migration from old flat skill payloads.
- Replaced the middle editor drag affordance with a clearer four-direction move icon.
- Added right-side preview module reordering that writes back to the same Pinia store as the middle editor.
- Updated preview rendering for education, grouped skills, profile links, current roles, and separator-safe optional fields.
- Added migration coverage so compatible old localStorage documents are upgraded before schema validation.

Validation:

- `corepack yarn lint`: passed.
- `corepack yarn typecheck`: passed.
- `corepack yarn test:unit`: passed, editor 7 tests and shared 9 tests.
- `corepack yarn test:e2e`: passed, Chromium 3 tests.
- `corepack yarn build`: passed.
- `git diff --check`: passed.
- Browser smoke at 1872x1009 and 390x844: passed with no body horizontal overflow, reachable preview drag handles, and no actionable console errors.

Changed Areas:

- `packages/shared`: resume schemas, education/grouped skill helpers, migration utilities, fixtures, and shared tests.
- `apps/editor`: field components, module editors, module registry, material panel, preview reorder flow, i18n, styles, store tests, and E2E tests.
- Project docs and workflow files: `README.md`, `.gitignore`, `PROJECT_PROGRESS.md`, `CODE_MAP.md`, and `specs/resume-editor-core-enhancements/*`.

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

- `yarn install --immutable`: passed.
- `yarn lint`: passed after mechanical style fixes.
- `yarn typecheck`: passed.
- `yarn test:unit`: passed, 9 tests.
- `yarn build`: passed.
- `yarn test:e2e`: passed in Chromium, 2 tests.
- `git diff --check`: passed.

Changed Areas:

- `packages/shared`: resume schemas, fixtures, API route constants, pure module helpers, and shared tests.
- `apps/editor`: store, API client/helper, MSW mocks, router, workspace layout, material/canvas/module components, module registry, styles, unit tests, and E2E tests.
- `apps/portfolio`: compatibility updates for shared resume model changes.
- Project docs and workflow files: `README.md`, `.gitignore`, `PROJECT_PROGRESS.md`, `CODE_MAP.md`, and `specs/monorepo-editor-mvp/*`.

## In Progress

- Feature: None.
- Current phase: Documentation and hygiene complete for `resume-editor-core-enhancements`.
- Next step: Review and commit the completed feature changes when ready.

## Known Risks

- Risk: The editor build still emits a large chunk warning because ECharts is bundled.
  Mitigation: Consider code-splitting chart code before production release gating.
- Risk: The portfolio build still emits Nuxt/Nitro dependency and Node deprecation warnings.
  Mitigation: Track during Nuxt/Nitro dependency updates.
- Risk: `yarn lint` emits a Node experimental ESM/CJS warning from ESLint tooling.
  Mitigation: Treat as non-blocking unless future Node/tooling versions turn it into a failure.
- Risk: E2E can emit a non-fatal Vite ResizeObserver notification during drag-heavy tests.
  Mitigation: Current Playwright assertions pass; revisit only if it becomes test-failing noise.
- Risk: The editor package path differs from the original `packages/editor` request.
  Mitigation: This was an explicit MVP decision to keep the existing `apps/editor` workspace shape.

## Last Updated

2026-07-05
