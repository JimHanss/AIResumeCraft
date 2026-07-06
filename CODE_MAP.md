# Code Map

## Workspace

- `apps/editor`: Vue 3 + Vite resume editor SPA.
- `apps/portfolio`: Nuxt 3 portfolio site and BFF routes.
- `packages/shared`: shared schemas, fixtures, API constants, and pure utilities.
- `specs/resume-editor-core-enhancements`: Spec workflow documents for the completed editor core enhancement.
- `specs/editor-theme-export-i18n`: Spec workflow documents for editor themes, PDF export, history, radar scoring, and i18n.
- `specs/editor-layout-metrics-cleanup`: Spec workflow documents for header score placement, sidebar score radar layout, and workspace metric cleanup.
- `specs/custom-module-builder`: Spec workflow documents for the custom module builder, responsive custom fields, and local persistence.
- `tests/e2e`: Playwright browser coverage for the editor.

## Spec Workflow Documents

### Resume Editor Core Enhancements

Paths:

- `specs/resume-editor-core-enhancements/spec.md`
- `specs/resume-editor-core-enhancements/plan.md`
- `specs/resume-editor-core-enhancements/tasks.md`
- `specs/resume-editor-core-enhancements/verify.md`

Purpose:

- Records the accepted scope, technical plan, completed task checklist, verification evidence, known risks, and follow-up notes for the education module, grouped skills, unified field controls, and preview reorder feature.

### Editor Theme Export I18n

Paths:

- `specs/editor-theme-export-i18n/spec.md`
- `specs/editor-theme-export-i18n/plan.md`
- `specs/editor-theme-export-i18n/tasks.md`
- `specs/editor-theme-export-i18n/verify.md`

Purpose:

- Records the Chinese spec workflow for preview themes, A4 PDF export, undo/redo, score radar visibility, validation, i18n coverage, and browser verification.

### Editor Layout Metrics Cleanup

Paths:

- `specs/editor-layout-metrics-cleanup/spec.md`
- `specs/editor-layout-metrics-cleanup/plan.md`
- `specs/editor-layout-metrics-cleanup/tasks.md`
- `specs/editor-layout-metrics-cleanup/verify.md`

Purpose:

- Records the Chinese spec workflow for removing workspace metric clutter, moving the score into the sticky header, and placing the radar chart below the module selector.

### Custom Module Builder

Paths:

- `specs/custom-module-builder/spec.md`
- `specs/custom-module-builder/plan.md`
- `specs/custom-module-builder/tasks.md`
- `specs/custom-module-builder/verify.md`

Purpose:

- Records the Chinese spec workflow, task completion, and verification evidence for adding a modal-based custom module builder with single-line fields, textarea fields, list fields, responsive grid spans, editor rendering, preview rendering, and local persistence.

## Pages / Screens

### Editor App Shell

Path:

- `apps/editor/src/App.vue`

Purpose:

- Hosts the editor route, global header, sticky score display, locale selector, and theme toggle.

Functions:

- `selectedLocale`: Bridges the Naive UI locale selector to the resume store locale.
- `overallScore`: Computes the sticky header score from shared score utilities with a safe fallback.

### Resume Workspace

Path:

- `apps/editor/src/components/ResumeWorkspace.vue`

Purpose:

- Loads initial resume data and lays out the material panel, left-side score radar, history controls, canvas, and preview.

Functions:

- `sidebarScore`: Computes the left-side score radar number from shared score utilities with a safe fallback.

### Portfolio Home

Path:

- `apps/portfolio/pages/index.vue`

Purpose:

- Displays the Nuxt portfolio landing page and links to the demo resume.

### Portfolio Resume Detail

Path:

- `apps/portfolio/pages/resume/[slug].vue`

Purpose:

- Renders the static demo resume from shared fixture data.

Functions:

- `slug`: Reads the route slug parameter for display/debug context.

## Editor Components

### Material Panel

Path:

- `apps/editor/src/components/MaterialPanel.vue`

Purpose:

- Shows avatar, summary, education, experience, and skills materials with local SVG icons, supports drag cloning into the canvas, and opens the custom module builder from the add-module button.

Functions:

- `cloneMaterial`: Creates a fresh module instance for vuedraggable clone operations.
- `addModule`: Opens the custom module builder dialog.
- `saveCustomModule`: Persists a configured custom module through the resume store.

### Custom Module Builder Dialog

Path:

- `apps/editor/src/components/CustomModuleBuilderDialog.vue`

Purpose:

- Provides the non-fullscreen modal used to configure custom module names, field types, field labels, placeholders, responsive grid widths, textarea row counts, list items, and field ordering.

Functions:

- `resetDraft`: Initializes a new or existing custom module draft when the modal opens.
- `addField`, `removeField`, and `updateField`: Maintain the custom field configuration list.
- `updateFieldType`: Converts one configured field between text, textarea, and list types.
- `updateListItems`, `addListItem`, `updateListItem`, and `removeListItem`: Maintain initial list field items.
- `save`: Validates the module name and emits a normalized custom module payload.

### Resume Canvas

Path:

- `apps/editor/src/components/ResumeCanvas.vue`

Purpose:

- Renders the ordered module list and handles vuedraggable add/reorder updates.

Functions:

- `modules`: Adapts `store.orderedModules` to a writable vuedraggable model.
- `selectAddedModule`: Selects a newly dragged module after it is added to the canvas.
- `updateModule`: Applies emitted module content patches through the store.

### Module Frame

Path:

- `apps/editor/src/components/ModuleFrame.vue`

Purpose:

- Provides shared module chrome: selection state, independent expansion, title drag handle, rename modal, and remove controls.

Functions:

- `openRenameModal`: Opens the module title edit dialog with the current display title.
- `confirmRename`: Emits a trimmed title when the rename dialog is saved.

### Resume Score Radar

Path:

- `apps/editor/src/components/ResumeScoreRadar.vue`

Purpose:

- Renders the ECharts score radar for the current resume score dimensions below the module selector, with a stable `resume-score-radar` test id and guarded ResizeObserver resize scheduling.

Functions:

- `renderChart`: Initializes or updates the ECharts radar instance from the current score props.

### Resume Preview

Path:

- `apps/editor/src/components/ResumePreview.vue`

Purpose:

- Renders the right-side resume preview, theme/typography/export controls, PDF export trigger, and whole-section `vuedraggable` body-module ordering synced with the Pinia store.

Functions:

- `bodyModules`: Adapts non-avatar modules to a writable preview ordering model.
- `startPreviewDrag`: Starts preview drag state and suppresses accidental text selection.
- `moduleTitle`: Reads a custom module title with a localized type-title fallback.
- `dateRange`, `textBullets`, `educationDetails`, and `skillItems`: Format preview-safe display values without dangling separators.
- `customFields`, `hasCustomFieldContent`, `customFieldStyle`, and `customListItems`: Format custom module fields for responsive preview rendering.

### History Controls

Path:

- `apps/editor/src/components/HistoryControls.vue`

Purpose:

- Provides semantic undo/redo navigation buttons wired to `useResumeStore.canUndo`, `canRedo`, `undo()`, and `redo()`.

### Field Components

Paths:

- `apps/editor/src/components/forms/FieldControl.vue`
- `apps/editor/src/components/forms/FieldGrid.vue`

Purpose:

- Provide reusable title-and-input layout primitives for editor module forms.

## Editor Module Components

### Avatar Module

Path:

- `apps/editor/src/components/modules/AvatarModule.vue`

Purpose:

- Edits basic profile fields: name, headline, email, phone, location, profile URL, and avatar URL.

Functions:

- `updateField`: Emits a patch for one avatar content field.

### Summary Module

Path:

- `apps/editor/src/components/modules/SummaryModule.vue`

Purpose:

- Edits the resume summary text.

### Experience Module

Path:

- `apps/editor/src/components/modules/ExperienceModule.vue`

Purpose:

- Edits repeatable experience entries with company, role, location, dates, current-role state, and description.

Functions:

- `updateItems`: Emits the full next experience item array.
- `updateItem`: Updates one field on one experience item.
- `addItem`: Appends a new blank experience item.
- `removeItem`: Removes an experience item by id.

### Education Module

Path:

- `apps/editor/src/components/modules/EducationModule.vue`

Purpose:

- Edits repeatable education entries with school, degree, field of study, location, dates, GPA, honors, coursework, and description.

Functions:

- `updateItems`: Emits the full next education item array.
- `updateItem`: Updates one field on one education item.
- `addItem`: Appends a new blank education item.
- `removeItem`: Removes an education item by id.

### Skills Module

Path:

- `apps/editor/src/components/modules/SkillsModule.vue`

Purpose:

- Edits grouped resume skills with named groups and repeatable skill items.

Functions:

- `withFallbackGroup`: Ensures the module never persists zero skill groups.
- `updateGroups`: Emits the next skill group array.
- `updateGroup`: Updates one skill group.
- `addGroup` and `removeGroup`: Add or remove skill groups.
- `updateSkill`, `addSkill`, and `removeSkill`: Mutate skill items inside a group.

### Custom Module

Path:

- `apps/editor/src/components/modules/CustomModule.vue`

Purpose:

- Renders custom module fields in the middle editor, supports text and textarea editing, list item add/remove/reorder, and opens the builder dialog to edit the custom module structure.

Functions:

- `orderedFields`: Sorts configured custom fields by order.
- `updateFields` and `updateField`: Emit custom field content updates through the canvas.
- `updateListItems`, `addListItem`, `updateListItem`, and `removeListItem`: Maintain custom list field content.
- `replaceSchema`: Emits updated custom module structure back to the canvas/store.

### Unsupported Module

Path:

- `apps/editor/src/components/modules/UnsupportedModule.vue`

Purpose:

- Renders a safe fallback when an unknown module type reaches the canvas.

### Module Registry

Path:

- `apps/editor/src/components/modules/moduleRegistry.ts`

Purpose:

- Maps module types to Vue components for dynamic canvas rendering.

Functions:

- `getModuleComponent`: Returns the component registered for a resume module type.

## State

### Resume Store

Path:

- `apps/editor/src/stores/resume.ts`

Purpose:

- Owns resume document state, material definitions, selected module state, preferences, session undo/redo history, persistence, and all module mutations.

Functions:

- `hasPersistedResume`: Detects whether localStorage already has persisted editor state.
- `shouldLoadMockApi`: Checks whether MSW-backed mock loading is enabled.
- `restoreDocument`: Safely parses and normalizes a resume document into store state.
- `loadInitialResume`: Initializes from persisted state, mock API data, or the default demo resume.
- `replaceSections`: Replaces legacy section data while normalizing order.
- `updateSection`: Patches one legacy section by id.
- `createModule`: Builds a new typed resume module with shared utilities.
- `addModule`: Inserts a new module after an optional target id and selects it.
- `addCustomModule`: Validates and inserts a configured custom module while selecting it.
- `replaceCustomModuleSchema`: Updates an existing custom module's title and field schema without creating a duplicate module.
- `reorderModules`: Normalizes module order and writes the reordered list.
- `updateModule`: Patches one module content object and syncs avatar fields to profile data.
- `removeModule`: Deletes one module and repairs selection if needed.
- `duplicateModule`: Clones a module, inserts it after the original, and selects the clone.
- `renameModule`: Updates one module title and rejects blank titles.
- `resetResume`: Restores the deterministic demo resume.
- `selectModule`: Sets the active module id.
- `setLocale`: Updates the resume document locale.
- `toggleTheme`: Toggles the persisted dark mode preference.
- `setResumeTheme`, `setPreviewFontFamily`, `setPreviewFontSize`, `setPreviewLineHeight`, `setPreviewAccentColor`, and `setExportQuality`: Update persisted editor preview/export preferences while recording undo history.
- `undo` and `redo`: Restore session snapshots of resume content and editor preferences.
- `syncProfileFromAvatar`: Mirrors avatar content into top-level profile fields for compatibility.

### Resume Themes

Path:

- `apps/editor/src/config/resumeThemes.ts`

Purpose:

- Defines `classic-blue`, `modern-sky`, and `mono-compact` preview themes, including localized label keys, CSS variables, and default typography/export preview values.

## API / Services

### Axios Client

Path:

- `apps/editor/src/api/client.ts`

Purpose:

- Provides the shared Axios instance for editor API calls.

Exports:

- `apiClient`: Configures base URL and JSON headers for editor requests.

### Resume API

Path:

- `apps/editor/src/api/resume.ts`

Purpose:

- Loads mockable resume data for editor initialization.

Functions:

- `getDemoResume`: Fetches the deterministic demo resume endpoint through `apiClient`.

### MSW Browser Worker

Path:

- `apps/editor/src/mocks/browser.ts`

Purpose:

- Creates the browser-side MSW worker from registered handlers.

Exports:

- `worker`: Starts request interception when mock mode is enabled.

### MSW Handlers

Path:

- `apps/editor/src/mocks/handlers.ts`

Purpose:

- Defines deterministic mock responses for editor-local development and tests.

Exports:

- `handlers`: Returns `demoResume` for the shared resume demo endpoint.

### AI Stream Composable

Path:

- `apps/editor/src/composables/useAIStream.ts`

Purpose:

- Keeps the later AI streaming helper isolated from the no-AI MVP workspace.

Functions:

- `useAIStream`: Exposes streaming state, a stream runner, and abort control.
- `stream`: Posts resume generation payloads and reads the streamed response.
- `abort`: Cancels the active streaming request.

### PDF Export Composable

Path:

- `apps/editor/src/composables/usePdfExport.ts`

Purpose:

- Encapsulates `html2canvas` and `jsPDF` for A4 portrait PDF export from the preview paper, with standard/high quality settings, loading state, error state, export-only styling, and multi-page canvas slicing.

### Resume Validation Composable

Path:

- `apps/editor/src/composables/useResumeValidation.ts`

Purpose:

- Provides reusable validation for required name, email format, non-empty preview export, and stable i18n error keys.

### Portfolio AI Route

Path:

- `apps/portfolio/server/api/ai/resume.post.ts`

Purpose:

- Handles resume generation requests for the Nuxt BFF route outside the no-AI editor MVP.

### Portfolio AI Providers

Path:

- `apps/portfolio/server/utils/ai/providers.ts`

Purpose:

- Selects a configured AI provider or mock provider for portfolio-side resume drafting.

Functions:

- `createResumeDraft`: Creates a resume draft through OpenAI, DeepSeek, Moonshot, or mock mode.
- `createMockDraft`: Returns deterministic mock AI output for local fallback behavior.

## Shared Package

### Resume Schemas

Path:

- `packages/shared/src/resume.ts`

Purpose:

- Defines Zod schemas and TypeScript types for locales, profile, legacy sections, typed modules, scores, and resume documents.

Exports:

- `resumeLocaleSchema`: Validates supported locale values.
- `resumeSectionTypeSchema`: Validates legacy portfolio section types.
- `resumeModuleTypeSchema`: Validates MVP editor module types.
- `resumeProfileSchema`: Validates top-level profile fields.
- `resumeSectionSchema`: Validates legacy markdown section data.
- `avatarResumeModuleSchema`: Validates editable avatar module content.
- `summaryResumeModuleSchema`: Validates editable summary module content.
- `educationResumeModuleSchema`: Validates editable education module content.
- `experienceResumeModuleSchema`: Validates editable experience module content.
- `skillsResumeModuleSchema`: Validates editable skills module content.
- `customResumeModuleSchema`: Validates custom module field schemas and content.
- `customResumeFieldSchema`: Validates custom text, textarea, and list fields.
- `customListItemSchema`: Validates custom list field items.
- `resumeModuleSchema`: Validates any discriminated resume module.
- `resumeScoreSchema`: Validates score dimensions and overall score.
- `resumeDocumentSchema`: Validates complete resume document payloads.

### Fixtures

Path:

- `packages/shared/src/fixtures.ts`

Purpose:

- Provides deterministic demo resume data with both new modules and legacy sections.

Exports:

- `demoResume`: Supplies the default resume for editor, portfolio, mocks, tests, and safe fallback.

### API Constants

Path:

- `packages/shared/src/api.ts`

Purpose:

- Centralizes shared route constants.

Exports:

- `apiRoutes`: Defines the resume demo endpoint used by the editor and MSW.

### Utilities

Path:

- `packages/shared/src/utils.ts`

Purpose:

- Provides pure helpers for ids, sorting, ordering, module creation, cloning, parsing, and scoring.

Functions:

- `uid`: Creates a short prefixed id.
- `sortSections`: Sorts legacy sections by order.
- `reorderSections`: Rewrites legacy section order values.
- `sortModules`: Sorts resume modules by order.
- `reorderModules`: Rewrites module order values.
- `createResumeModule`: Builds default content for one module type.
- `cloneResumeModule`: Deep-clones a module with a fresh id.
- `createExperienceItem`: Builds a blank experience item.
- `createEducationItem`: Builds a blank education item.
- `createSkillGroup`: Builds a blank grouped skills item.
- `createCustomField`: Builds a custom text, textarea, or list field.
- `createCustomListItem`: Builds a custom list field item.
- `createCustomResumeModule`: Builds a custom module with normalized fields.
- `normalizeCustomFields`: Rewrites custom field order values.
- `safeResumeDocument`: Migrates compatible old module payloads, parses unknown input, and falls back to a known-good resume.
- `calculateOverallScore`: Reads the overall score with a safe zero fallback.

## Tests

### Store and Utility Tests

Paths:

- `apps/editor/src/__tests__/resume-store.spec.ts`
- `apps/editor/src/components/__tests__/ResumePreview.spec.ts`
- `apps/editor/src/composables/__tests__/useResumeValidation.spec.ts`
- `packages/shared/src/utils.spec.ts`

Purpose:

- Cover module creation, education and grouped skills behavior, custom module creation/migration/preview rendering, migration defaults, unique ids, reorder normalization, update isolation, safe restore, preview preferences, undo/redo, PDF export trigger flow, validation, and shared utility behavior.

### Editor E2E

Path:

- `tests/e2e/editor.spec.ts`

Purpose:

- Verifies editor loading, local SVG material icons, sticky header score behavior, left-side score radar placement, removed workspace metrics, custom module creation/editing/persistence/deletion, theme and typography persistence, undo/redo, responsive overflow checks, module title editing, middle and preview module reorder, education editing, grouped skill editing, and localStorage refresh restore in Chromium.

Functions:

- `openFreshEditor`: Opens the editor after clearing persisted localStorage.
- `createCustomModule`: Creates a minimal custom module through the add-module dialog.

## Validation

```bash
corepack yarn install --immutable
corepack yarn workspace @airesumecraft/editor typecheck
corepack yarn lint
corepack yarn typecheck
corepack yarn test:unit
corepack yarn test:e2e
corepack yarn build
git diff --check
```

Manual browser smoke checks for feature verification are recorded in `specs/resume-editor-core-enhancements/verify.md`, `specs/editor-theme-export-i18n/verify.md`, `specs/editor-layout-metrics-cleanup/verify.md`, and `specs/custom-module-builder/verify.md`.
