# Code Map

## Workspace

- `apps/editor`: Vue 3 + Vite resume editor SPA.
- `apps/portfolio`: Nuxt 3 portfolio site and BFF routes.
- `packages/shared`: shared schemas, fixtures, API constants, and pure utilities.
- `specs/resume-editor-core-enhancements`: Spec workflow documents for the completed editor core enhancement.
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

## Pages / Screens

### Editor App Shell

Path:

- `apps/editor/src/App.vue`

Purpose:

- Hosts the editor route, global header, locale selector, and theme toggle.

Functions:

- `selectedLocale`: Bridges the Naive UI locale selector to the resume store locale.

### Resume Workspace

Path:

- `apps/editor/src/components/ResumeWorkspace.vue`

Purpose:

- Loads initial resume data and lays out the material panel, canvas, state summary, score radar, and preview.

Functions:

- `overallScore`: Computes the displayed resume score from shared score utilities.

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

- Shows avatar, summary, education, experience, and skills materials with local SVG icons and supports drag cloning into the canvas.

Functions:

- `cloneMaterial`: Creates a fresh module instance for vuedraggable clone operations.
- `addMaterial`: Adds the selected material directly through the store.

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

- Renders the ECharts score radar for the current resume score dimensions.

Functions:

- `renderChart`: Initializes or updates the ECharts radar instance from the current score props.

### Resume Preview

Path:

- `apps/editor/src/components/ResumePreview.vue`

Purpose:

- Renders the right-side resume preview, labeled template controls, and whole-section `vuedraggable` body-module ordering synced with the Pinia store.

Functions:

- `bodyModules`: Adapts non-avatar modules to a writable preview ordering model.
- `startPreviewDrag`: Starts preview drag state and suppresses accidental text selection.
- `moduleTitle`: Reads a custom module title with a localized type-title fallback.
- `dateRange`, `textBullets`, `educationDetails`, and `skillItems`: Format preview-safe display values without dangling separators.

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

- Owns resume document state, material definitions, selected module state, preferences, persistence, and all module mutations.

Functions:

- `hasPersistedResume`: Detects whether localStorage already has persisted editor state.
- `shouldLoadMockApi`: Checks whether MSW-backed mock loading is enabled.
- `restoreDocument`: Safely parses and normalizes a resume document into store state.
- `loadInitialResume`: Initializes from persisted state, mock API data, or the default demo resume.
- `replaceSections`: Replaces legacy section data while normalizing order.
- `updateSection`: Patches one legacy section by id.
- `createModule`: Builds a new typed resume module with shared utilities.
- `addModule`: Inserts a new module after an optional target id and selects it.
- `reorderModules`: Normalizes module order and writes the reordered list.
- `updateModule`: Patches one module content object and syncs avatar fields to profile data.
- `removeModule`: Deletes one module and repairs selection if needed.
- `duplicateModule`: Clones a module, inserts it after the original, and selects the clone.
- `renameModule`: Updates one module title and rejects blank titles.
- `resetResume`: Restores the deterministic demo resume.
- `selectModule`: Sets the active module id.
- `setLocale`: Updates the resume document locale.
- `toggleTheme`: Toggles the persisted dark mode preference.
- `syncProfileFromAvatar`: Mirrors avatar content into top-level profile fields for compatibility.

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
- `safeResumeDocument`: Migrates compatible old module payloads, parses unknown input, and falls back to a known-good resume.
- `calculateOverallScore`: Reads the overall score with a safe zero fallback.

## Tests

### Store and Utility Tests

Paths:

- `apps/editor/src/__tests__/resume-store.spec.ts`
- `packages/shared/src/utils.spec.ts`

Purpose:

- Cover module creation, education and grouped skills behavior, migration defaults, unique ids, reorder normalization, update isolation, safe restore, and shared utility behavior.

### Editor E2E

Path:

- `tests/e2e/editor.spec.ts`

Purpose:

- Verifies editor loading, local SVG material icons, sticky header behavior, material drag-in for all module types, independent expansion, module title editing, middle and preview module reorder, education editing, grouped skill editing, and localStorage refresh restore in Chromium.

Functions:

- `openFreshEditor`: Opens the editor after clearing persisted localStorage.
- `dragMaterialToCanvas`: Uses mouse gestures to drag a material into the canvas.

## Validation

```bash
corepack yarn install --immutable
corepack yarn lint
corepack yarn typecheck
corepack yarn test:unit
corepack yarn test:e2e
corepack yarn build
git diff --check
```

Manual browser smoke checks for feature verification are recorded in `specs/resume-editor-core-enhancements/verify.md`.
