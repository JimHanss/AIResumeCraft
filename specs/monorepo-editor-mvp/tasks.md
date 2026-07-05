# Monorepo Editor MVP Tasks

## Decisions

- [x] T001 Confirm editor package location: keep `apps/editor` or migrate to `packages/editor`. Decision: keep `apps/editor`.
- [x] T002 Confirm compatibility strategy for existing Nuxt portfolio usage of `demoResume.sections`. Decision: preserve `sections`.
- [x] T003 Confirm no-AI MVP behavior: remove AI controls from the primary editor workspace or hide/isolate them for later. Decision: remove from primary workspace.

## Workspace and Housekeeping

- [x] T004 Check `.gitignore` for generated artifacts from the MVP workflow, including editor build output, test output, Playwright output, `.nuxt`, `.output`, `dist`, and `*.tsbuildinfo`.
- [x] T005 If `packages/editor` is required, migrate `apps/editor` to `packages/editor` and update Yarn workspace config, root scripts, Playwright config, README paths, and package filters. Not applicable after T001.
- [x] T006 If `apps/editor` is kept, document that decision in `PROJECT_PROGRESS.md` and leave workspace scripts unchanged unless needed for MVP commands.

## Shared Resume Model

- [x] T007 Extend `packages/shared/src/resume.ts` with typed resume module schemas for `avatar`, `summary`, `experience`, and `skills`.
- [x] T008 Add `ResumeModule`, `ResumeModuleType`, and module-specific content TypeScript exports.
- [x] T009 Preserve existing `ResumeSection` and `sections` compatibility until portfolio usage is migrated or explicitly removed.
- [x] T010 Update `packages/shared/src/fixtures.ts` with a deterministic demo resume containing MVP `modules`.
- [x] T011 Add shared helpers in `packages/shared/src/utils.ts` for creating, cloning, sorting, and reordering resume modules.
- [x] T012 Add defensive parsing or fallback helpers for invalid persisted resume payloads.

## Mocked Data Access

- [x] T013 Add a shared API route constant for the mock resume endpoint, such as `/api/resume/demo`.
- [x] T014 Add an Axios-backed editor API helper for loading the mock resume document.
- [x] T015 Extend `apps/editor/src/mocks/handlers.ts` so MSW returns deterministic fake resume data for the resume endpoint.
- [x] T016 Ensure MSW remains opt-in for development/test workflows and falls back safely when disabled.

## Pinia Store

- [x] T017 Expand `useResumeStore` to initialize from persisted data, mock/default data, and schema-safe fallback.
- [x] T018 Add store state for selected module id and editor preferences.
- [x] T019 Add store actions for `loadInitialResume`, `addModule`, `reorderModules`, `updateModule`, `removeModule`, `duplicateModule`, and `resetResume`.
- [x] T020 Add getters/selectors for `orderedModules`, `selectedModule`, and available material definitions.
- [x] T021 Ensure every material drag/add creates a distinct module id.
- [x] T022 Ensure every reorder normalizes module `order` values before persistence.

## Editor UI

- [x] T023 Split `ResumeWorkspace.vue` into a small page shell plus focused components.
- [x] T024 Add `MaterialPanel.vue` with avatar, summary, experience, and skills material entries.
- [x] T025 Add `ResumeCanvas.vue` using `vuedraggable` for adding material clones and reordering existing modules.
- [x] T026 Add `ModuleFrame.vue` for selection state, common module chrome, duplicate, and remove actions.
- [x] T027 Add a typed module registry mapping module type to Vue component and default display metadata.
- [x] T028 Add `AvatarModule.vue` with editable basic information and avatar URL fields.
- [x] T029 Add `SummaryModule.vue` with editable summary text.
- [x] T030 Add `ExperienceModule.vue` with editable experience items and at least add/remove item controls.
- [x] T031 Add `SkillsModule.vue` with editable skills list and add/remove skill controls.
- [x] T032 Add `UnsupportedModule.vue` fallback for unknown or invalid module types.
- [x] T033 Remove or isolate the existing AI button and AI stream output from the primary no-AI MVP workspace.
- [x] T034 Preserve a polished responsive editor layout with a left material panel, central canvas, and compact editing controls.

## Tests

- [x] T035 Update existing Pinia test setup so store tests start from a clean Pinia instance and clean persisted state.
- [x] T036 Add a store test for adding modules from materials and verifying unique ids.
- [x] T037 Add a store test for module reordering and normalized order values.
- [x] T038 Add a store test for editing module content without mutating unrelated modules.
- [x] T039 Add a store test for invalid persisted data falling back to a safe default resume.
- [x] T040 Update the existing E2E smoke test selectors or text expectations if the editor landing UI changes.

## Documentation and Project Tracking

- [x] T041 Create or update `PROJECT_PROGRESS.md` with current milestone status, decisions made, completed tasks, and remaining risks.
- [x] T042 Create or update `CODE_MAP.md` with the editor MVP module map, shared package responsibilities, store flow, and validation commands.
- [x] T043 Update `README.md` with no-AI editor MVP local usage, mock behavior, localStorage reset instructions, and verification commands.

## Verification

- [x] T044 Run `yarn install --immutable` and verify dependency state is clean.
- [x] T045 Run `yarn lint` and fix lint issues.
- [x] T046 Run `yarn typecheck` and fix type issues.
- [x] T047 Run `yarn test:unit` and fix unit test failures.
- [x] T048 Run `yarn build` and fix build failures.
- [x] T049 Optionally run `yarn playwright install chromium` then `yarn test:e2e` when the browser download is available. Completed with Chromium installed through the Playwright mirror fallback and `yarn test:e2e` passing.
- [x] T050 Manually smoke test the editor: drag each module type into the canvas, reorder modules, edit content, refresh, and confirm localStorage restore. Covered by Playwright Chromium E2E: all four material types drag into the canvas, modules reorder, edited name persists after refresh.

## Completion

- [x] T051 Review `git status --short` and ensure only intended MVP files are changed.
- [x] T052 Summarize implementation results, validation outputs, known warnings, and any skipped checks.
