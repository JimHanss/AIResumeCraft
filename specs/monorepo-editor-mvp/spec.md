# Monorepo Editor MVP

## Goal

Build the local-first foundation for a resume editor MVP: a Yarn monorepo with a Vue 3 visual editor, shared resume data contracts, draggable resume modules, editable canvas rendering, local persistence, mocked API data, and passing unit tests. The milestone is a fully runnable resume editor without AI capabilities.

## Users

- Resume creators who need to edit and rearrange resume sections visually.
- Developers maintaining the editor and shared data model.
- Product reviewers validating the non-AI editing workflow locally.

## User Scenarios

- As a resume creator, I can open the editor locally and see a resume canvas with editable modules.
- As a resume creator, I can drag modules from a left-side material panel into the resume canvas.
- As a resume creator, I can reorder existing resume modules by drag and drop.
- As a resume creator, I can edit basic information and module content directly in the editor.
- As a returning user, my edits persist in localStorage after page refresh.
- As a developer, I can run unit tests that verify the core Pinia store behavior.

## In Scope

- Yarn workspace foundation with an editor package and shared package.
- Vue 3 + Vite + TypeScript editor application.
- Naive UI integration for the editor UI.
- Shared resume data structures for profile/basic information and ordered module arrays.
- Pinia `useResumeStore` for resume document state, module operations, and persisted data.
- Left-side material panel containing at least avatar, summary, experience, and skills modules.
- Drag-and-drop support for adding modules to the canvas and reordering canvas modules.
- Dynamic component rendering for resume modules on the canvas.
- Editable module content for avatar, summary, experience, and skills.
- Axios client wrapper for future API access.
- MSW mock interception returning fake resume-related data.
- ESLint, Prettier, husky, lint-staged, and commit message convention setup.
- Two to three Vitest unit tests covering core resume store behavior.

## Out of Scope

- AI generation, AI rewriting, streaming responses, or model provider integration.
- Authentication, user accounts, cloud persistence, or backend database storage.
- Public portfolio/SSG site changes.
- Export to PDF, Word, image, or shareable links.
- Advanced template marketplace, theme editor, or typography controls.
- Production deployment setup beyond local runnable scripts.

## Acceptance Criteria

- The project installs with Yarn and exposes runnable editor scripts.
- The editor can be launched locally and displays a visual resume editing workspace.
- The left material panel exposes avatar, summary, experience, and skills module entries.
- A user can drag a module into the canvas.
- A user can reorder modules already on the canvas.
- Each MVP module can be edited through visible controls or inline editable fields.
- Resume state is stored through Pinia and persisted to localStorage.
- Refreshing the page restores the last edited resume state.
- Axios wrapper exists and is used by mockable data access code.
- MSW intercepts at least one resume-related request and returns deterministic fake data.
- ESLint, Prettier, husky, lint-staged, and commitlint are configured.
- Vitest unit tests cover adding/reordering/updating persisted resume store data.
- Unit tests pass with the repository test command.

## Edge Cases

- Dragging the same material multiple times should create distinct module instances.
- Reordering should keep module order stable and deterministic after persistence restore.
- Empty editable fields should not crash the canvas.
- Missing mock response data should fall back to safe default resume data.
- Unsupported module types should render a safe placeholder instead of breaking the editor.
- localStorage parse failures should reset to default data instead of crashing startup.

## Assumptions

- This MVP is intentionally local-first and does not require AI or backend services.
- Browser localStorage is sufficient for persistence at this milestone.
- The initial supported module set is avatar, summary, experience, and skills.
- Module content can use simple form fields rather than a rich text editor.
- MSW mocks are enabled for development/test workflows only.
- The requested package layout is `packages/editor` and `packages/shared`, but the existing repository already contains `apps/editor`; this needs confirmation before implementation.

## Clarifications Needed

- Should the existing `apps/editor` package be migrated/renamed to `packages/editor`, or should the current `apps/editor` layout be kept while satisfying the MVP behavior?
