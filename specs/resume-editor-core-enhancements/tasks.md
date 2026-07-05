# Resume Editor Core Enhancements Tasks

## Decisions

- [x] T001 Confirm whether to add an education module. Decision: add `education` as a first-pass resume module.
- [x] T002 Confirm whether skills should support grouped editing in the first pass. Decision: implement grouped skills editing now.

## Workspace And Housekeeping

- [x] T003 Review current dirty worktree with `git status --short` and avoid reverting unrelated Yarn migration, UI, and docs changes.
- [x] T004 Check `.gitignore` for generated artifacts from this enhancement, including Playwright screenshots/traces, editor `dist`, Nuxt `.output`, `.nuxt`, coverage, and tsbuild output.
- [x] T005 If verification creates new generated artifacts, update `.gitignore` before committing implementation work.

## Shared Resume Model

- [x] T006 Extend `packages/shared/src/resume.ts` so `resumeModuleTypeSchema` includes `education`.
- [x] T007 Add `educationResumeModuleSchema` with school, degree, field, location, dates, GPA, honors, coursework, and description fields.
- [x] T008 Export `EducationResumeModule` and any useful nested education item types from `packages/shared/src/resume.ts`.
- [x] T009 Extend `avatarResumeModuleSchema` with a `profileUrl` field.
- [x] T010 Extend `experienceResumeModuleSchema` item shape with `location` and `current`.
- [x] T011 Replace flat skills module content schema with grouped skills content: `groups: [{ id, name, skills }]`.
- [x] T012 Keep `resumeSectionTypeSchema` compatibility unchanged unless required by the new module fixture.
- [x] T013 Update TypeScript discriminated union exports so `ResumeModule`, `ResumeModuleType`, and `ResumeModuleFor<T>` remain exhaustive and type-safe.

## Shared Helpers And Migration

- [x] T014 Add `createEducationItem()` in `packages/shared/src/utils.ts`.
- [x] T015 Add `createSkillGroup()` in `packages/shared/src/utils.ts`.
- [x] T016 Update `createResumeModule('education')` with a safe default education item.
- [x] T017 Update `createResumeModule('skills')` to create grouped skills content.
- [x] T018 Update `createResumeModule('avatar')` to include `profileUrl`.
- [x] T019 Update `createResumeModule('experience')` to include `location` and `current` defaults.
- [x] T020 Update `cloneResumeModule()` to regenerate nested ids for education items and skill groups.
- [x] T021 Add migration logic before schema validation so old flat skills payloads become grouped skills payloads.
- [x] T022 Add migration logic so old experience items receive default `location` and `current` fields.
- [x] T023 Add migration logic so old avatar modules receive default `profileUrl`.
- [x] T024 Ensure `safeResumeDocument()` migrates compatible old documents before falling back to `demoResume`.

## Demo Data And Mock Data

- [x] T025 Update `packages/shared/src/fixtures.ts` with a `module-education` demo module placed between summary and experience.
- [x] T026 Update demo skills fixture from flat skills to grouped skills.
- [x] T027 Add a profile URL to the demo avatar/basic-info fixture.
- [x] T028 Update demo experience fixture with location and current-role semantics.
- [x] T029 Update `sections` fixture content only as needed to preserve portfolio compatibility.
- [x] T030 Confirm MSW handlers still return the updated `demoResume` shape without extra API changes.

## Editor Store And Materials

- [x] T031 Add `education` to `materialDefinitions` in `apps/editor/src/stores/resume.ts`.
- [x] T032 Ensure `addFirstInactiveModule()` considers education in the expected module order.
- [x] T033 Ensure module toggles, `removeModulesByType()`, `duplicateModule()`, and `reorderModules()` work for education and grouped skills without type-specific regressions.
- [x] T034 Update `syncProfileFromAvatar()` to keep profile state aligned with new avatar fields where appropriate.

## Shared Form Components

- [x] T035 Add `apps/editor/src/components/forms/FieldControl.vue` for consistent title-and-input layout.
- [x] T036 Add responsive field layout styles for labels, hints, error/help text, and slotted controls.
- [x] T037 Add `FieldGrid.vue` or equivalent layout helper if repeated two-column field layouts justify it.

## Module Form Updates

- [x] T038 Migrate `AvatarModule.vue` to `FieldControl` and expose name, headline, phone, email, location, profile URL, and avatar URL.
- [x] T039 Keep stable E2E selectors for key avatar fields, including `avatar-name-input`.
- [x] T040 Migrate `SummaryModule.vue` to `FieldControl` around the multiline summary textarea.
- [x] T041 Migrate `ExperienceModule.vue` fields to `FieldControl`.
- [x] T042 Add editable experience location and current-role controls.
- [x] T043 Keep experience description as multiline bullet text and ignore blank bullet lines in preview rendering.
- [x] T044 Add `EducationModule.vue` with add/remove education item controls.
- [x] T045 Implement education fields for school, degree, field of study, location, start/end dates, GPA, honors, coursework, and description.
- [x] T046 Replace `SkillsModule.vue` flat dynamic tags with grouped skill editing.
- [x] T047 Add group add/remove controls for skills.
- [x] T048 Add dynamic skill item controls inside each skill group.
- [x] T049 Ensure skills never persist an empty module with zero groups; create a fallback group when needed.

## Module Registry And Left Panel

- [x] T050 Register `EducationModule.vue` in `apps/editor/src/components/modules/moduleRegistry.ts`.
- [x] T051 Update module registry exhaustiveness so `Record<ResumeModuleType, Component>` compiles with education.
- [x] T052 Add education icon text to `MaterialPanel.vue`.
- [x] T053 Ensure left module selection switch state remains accurate for education and duplicate module cases.

## Drag Handles And Editor Canvas

- [x] T054 Replace the `::` drag handle in `ModuleFrame.vue` with a clearer four-direction move icon.
- [x] T055 Keep the drag handle accessible with localized title/aria text and keyboard-safe focus styling.
- [x] T056 Preserve drag text-selection guard behavior for middle editor dragging.
- [x] T057 Confirm middle editor drag ordering still normalizes module order after education is added.

## Resume Preview

- [x] T058 Refactor `ResumePreview.vue` body modules into a computed draggable list excluding avatar/basic-info header modules.
- [x] T059 Wrap preview body modules with `vuedraggable` and write reordered modules back through `store.reorderModules()`.
- [x] T060 Add stable preview test selectors: `preview-module` and `preview-module-drag`.
- [x] T061 Add education preview rendering with school, degree/field, dates, location, GPA, honors, coursework, and description.
- [x] T062 Add grouped skills preview rendering with group labels and skill lists.
- [x] T063 Update experience preview to render location and localized `Present` when `current` is true.
- [x] T064 Ensure empty phone, email, profile URL, location, dates, and bullet fields do not leave dangling separators.
- [x] T065 Reuse `useDragSelectionGuard()` for preview drag start/end.

## Internationalization And Styling

- [x] T066 Add zh-CN and en-US i18n keys for education module labels, profile URL, current role, school, degree, field, GPA, honors, coursework, skill group, add/remove group, and preview drag.
- [x] T067 Keep Chinese strings in the existing escaped `\uXXXX` style or otherwise ensure UTF-8 without BOM.
- [x] T068 Add CSS for `FieldControl`, field grids, education items, skill groups, and preview draggable states.
- [x] T069 Verify desktop layout still fits the three-column reference UX with the added education module.
- [x] T070 Verify mobile layout does not horizontally overflow and drag handles remain reachable.

## Unit And Integration Tests

- [x] T071 Update `packages/shared/src/utils.spec.ts` for education module creation.
- [x] T072 Update shared tests for grouped skill module creation.
- [x] T073 Add shared tests for migration from old flat skills to grouped skills.
- [x] T074 Add shared tests for migration defaults on old avatar and experience modules.
- [x] T075 Update `apps/editor/src/__tests__/resume-store.spec.ts` default module count from 4 to 5.
- [x] T076 Add store tests for adding, updating, duplicating, and removing education modules.
- [x] T077 Add store tests for grouped skills updates.
- [x] T078 Add store tests for reorder behavior used by preview body modules.

## E2E Tests

- [x] T079 Update `tests/e2e/editor.spec.ts` material types to include `education`.
- [x] T080 Add E2E coverage for editing and persisting an education school field.
- [x] T081 Add E2E coverage for grouped skill name and skill item editing.
- [x] T082 Add E2E coverage for preview body module drag ordering.
- [x] T083 Add E2E assertions that preview reorder syncs middle editor order.
- [x] T084 Preserve existing E2E coverage for middle editor drag, content edit, and refresh persistence.

## Documentation And Project Tracking

- [x] T085 Update `specs/resume-editor-core-enhancements/spec.md` to resolve the old clarification questions with the confirmed decisions.
- [x] T086 Update `CODE_MAP.md` with education module, grouped skills model, field components, and preview reorder flow.
- [x] T087 Update `PROJECT_PROGRESS.md` with the enhancement status, decisions, validation results, and remaining risks.
- [x] T088 Update `README.md` only if the user-facing module list or validation workflow changes.

## Verification

- [x] T089 Run `corepack yarn lint` and fix all lint issues.
- [x] T090 Run `corepack yarn typecheck` and fix all type errors.
- [x] T091 Run `corepack yarn test:unit` and fix all unit test failures.
- [x] T092 Run `corepack yarn test:e2e` and fix all E2E failures.
- [x] T093 Run `corepack yarn build` and fix all build failures.
- [x] T094 Run browser visual smoke checks on desktop around `1872x1009`.
- [x] T095 Run browser visual smoke checks on mobile around `390x844`.
- [x] T096 Check browser console for runtime errors unrelated to known favicon or dev-server warnings.

## Completion

- [x] T097 Review `git status --short` and ensure changes are limited to the enhancement and already-existing unrelated worktree changes are not reverted.
- [x] T098 Summarize implementation scope, validation outputs, known warnings, and any skipped checks.
