# Monorepo Editor MVP Plan

## Affected Files and Modules

- `pnpm-workspace.yaml`
  - Keep current workspace support for `apps/*` and `packages/*`.
  - Only change if the editor package is migrated from `apps/editor` to `packages/editor`.
- `package.json`
  - Reuse existing root scripts for install, dev, lint, typecheck, test, and build.
  - Adjust filters only if package location changes.
- `apps/editor/package.json`
  - Reuse existing Vue 3, Vite, TypeScript, Naive UI, Pinia, vuedraggable, Axios, MSW, and Vitest dependencies.
- `apps/editor/src/stores/resume.ts`
  - Expand the store from section markdown editing into MVP module operations.
- `apps/editor/src/components/ResumeWorkspace.vue`
  - Split the current all-in-one workspace into material panel, editable canvas, inspector/editor controls, and preview concerns.
- `apps/editor/src/components/**`
  - Add module renderer components for avatar, summary, experience, and skills.
  - Add a module registry to map resume module types to editable Vue components.
- `apps/editor/src/api/client.ts`
  - Keep the Axios wrapper and expose typed request helpers for mockable resume loading.
- `apps/editor/src/mocks/handlers.ts`
  - Add deterministic resume mock endpoints.
- `apps/editor/src/__tests__/*.spec.ts`
  - Expand store tests to cover adding modules, reordering modules, editing content, and restore-safe defaults.
- `packages/shared/src/resume.ts`
  - Replace or extend generic markdown sections with a typed resume module model.
- `packages/shared/src/fixtures.ts`
  - Update demo data to the typed MVP module model.
- `packages/shared/src/utils.ts`
  - Add module creation, ordering, cloning, and safe parsing helpers.
- `README.md`
  - Document the local no-AI editor flow and validation commands.

## Architecture and Data Flow

The MVP should be local-first and store-driven:

1. `packages/shared` owns stable resume types, Zod schemas, default fixtures, and pure utilities.
2. `apps/editor` imports shared types and fixtures.
3. MSW intercepts a resume fetch request and returns deterministic mock resume data.
4. Axios wrapper exposes the resume fetch call.
5. `useResumeStore` initializes from persisted localStorage when available, otherwise from mock/default data.
6. The editor UI reads and writes exclusively through `useResumeStore`.
7. The left material panel provides module templates.
8. Dragging a material into the canvas creates a new module instance with a unique id.
9. Dragging within the canvas reorders module ids and normalizes `order`.
10. The canvas renders modules through a registry: `module.type -> component`.
11. Each module component emits updates through the store.
12. Pinia persisted state writes the full resume document and editor preferences to localStorage.

Recommended component boundaries:

- `ResumeWorkspace.vue`: page shell and store wiring.
- `MaterialPanel.vue`: available module templates.
- `ResumeCanvas.vue`: draggable ordered module list.
- `ModuleFrame.vue`: selection, delete/duplicate affordances, common layout.
- `modules/AvatarModule.vue`
- `modules/SummaryModule.vue`
- `modules/ExperienceModule.vue`
- `modules/SkillsModule.vue`
- `modules/UnsupportedModule.vue`
- `moduleRegistry.ts`: typed map for dynamic components and default module factories.

## Data Model Changes

Current shared model uses `ResumeSection` with `type`, `title`, `markdown`, and `order`. The MVP needs module-specific editable data.

Proposed model:

```ts
type ResumeModuleType = 'avatar' | 'summary' | 'experience' | 'skills'

interface BaseResumeModule {
  id: string
  type: ResumeModuleType
  title: string
  order: number
}

interface AvatarModule extends BaseResumeModule {
  type: 'avatar'
  content: {
    name: string
    headline: string
    email: string
    phone?: string
    location?: string
    avatarUrl?: string
  }
}

interface SummaryModule extends BaseResumeModule {
  type: 'summary'
  content: {
    text: string
  }
}

interface ExperienceModule extends BaseResumeModule {
  type: 'experience'
  content: {
    items: Array<{
      id: string
      company: string
      role: string
      startDate?: string
      endDate?: string
      description: string
    }>
  }
}

interface SkillsModule extends BaseResumeModule {
  type: 'skills'
  content: {
    skills: string[]
  }
}
```

`ResumeDocument` should include:

- `id`
- `locale`
- `profile` for top-level compatibility if still needed by portfolio and existing code
- `modules`
- optional `score` only if existing portfolio/editor score display still depends on it

Migration compatibility:

- Keep legacy `sections` only if needed to avoid touching portfolio in this MVP.
- Prefer adding `modules` while leaving `sections` temporarily available.
- Add utility conversion only if current demo/portfolio code must keep using sections.

## API or Interface Changes

- Add shared API route constant for a no-AI resume mock endpoint, for example `apiRoutes.resume`.
- Add editor API helper:
  - `getMockResume(): Promise<ResumeDocument>`
- Add `useResumeStore` actions:
  - `loadInitialResume()`
  - `addModule(type: ResumeModuleType, afterId?: string)`
  - `reorderModules(modules: ResumeModule[])`
  - `updateModule<T extends ResumeModuleType>(id: string, patch: Partial<ResumeModuleFor<T>['content']>)`
  - `removeModule(id: string)`
  - `duplicateModule(id: string)`
  - `resetResume()`
- Add selectors/getters:
  - `orderedModules`
  - `selectedModule`
  - `availableMaterials`
- MSW handler:
  - `GET /api/resume/demo` returns the deterministic fixture.

## Implementation Steps

1. Confirm editor package location.
   - Recommended default: keep `apps/editor` because the repository already uses it and the workspace is already stable.
   - If strict package naming is required, migrate `apps/editor` to `packages/editor` and update root scripts, Playwright config, README, and workspace filters.
2. Update shared resume schema.
   - Add discriminated module schemas for avatar, summary, experience, and skills.
   - Add default module factories and a demo `ResumeDocument` with modules.
   - Keep existing section exports temporarily if portfolio still imports them.
3. Expand shared utilities.
   - Add `createResumeModule`, `cloneResumeModule`, `reorderModules`, and `safeResumeDocument`.
   - Preserve current score/order utilities if still used.
4. Update `useResumeStore`.
   - Move from markdown section-only editing to module operations.
   - Add selected module state.
   - Keep Pinia persistence key stable unless a migration reset is acceptable.
   - Add defensive reset on invalid persisted data.
5. Add mockable data loading.
   - Add Axios helper for mock resume fetch.
   - Add MSW handler for the resume endpoint.
   - Wire initial load to use fixture fallback if request fails.
6. Build the editor UI.
   - Introduce a left material panel with module templates.
   - Introduce a canvas with `vuedraggable` in clone/add and reorder modes.
   - Render dynamic components through the module registry.
   - Provide edit controls inside each module or in a compact inspector area.
7. Remove or isolate AI controls from the MVP screen.
   - The spec explicitly targets a no-AI editor.
   - Keep existing `useAIStream` code only if unused, or route it out of the MVP workspace.
8. Add tests.
   - Store initializes with default or mock resume data.
   - Adding a material creates a distinct id and persists module shape.
   - Reordering normalizes order.
   - Updating module content mutates only the targeted module.
   - Invalid persisted payload resets safely.
9. Update E2E smoke test only if selectors or visible text change.
10. Run validation commands and fix regressions.

## Risks

- Package location mismatch: the spec asks for `packages/editor`, but the current committed app is `apps/editor`.
- Data model migration can break existing portfolio pages that currently read `demoResume.sections`.
- `vuedraggable` clone behavior can accidentally reuse ids unless module creation is centralized.
- Pinia persisted state can restore stale legacy data unless guarded by schema parsing and fallback.
- Existing AI-oriented editor controls conflict with the no-AI MVP scope and should be removed from the primary workflow.
- ECharts/Naive UI bundle size warning exists today and can persist unless module loading is split later; this is not blocking for MVP.
- Playwright E2E depends on local browser installation; unit tests are the primary required milestone validation.

## Validation Commands

Run after implementation:

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm build
```

Optional local browser validation:

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

Manual smoke checks:

- Start the editor with `pnpm dev:editor`.
- Open `http://127.0.0.1:5173`.
- Drag avatar, summary, experience, and skills modules from the material panel to the canvas.
- Reorder modules on the canvas.
- Edit each module and refresh the page.
- Confirm edited state restores from localStorage.

## Documentation Updates Required

- Update `README.md` with:
  - no-AI editor MVP purpose,
  - local development command,
  - mock mode behavior,
  - validation commands,
  - localStorage reset instructions.
- Optionally add short comments in module registry or shared schema only where the data model would otherwise be hard to infer.

## Confirmation Needed

- Confirm whether to keep `apps/editor` or migrate it to `packages/editor`.
  - Recommended: keep `apps/editor` for this MVP because it avoids churn and matches the already committed monorepo shape.
- Confirm whether portfolio compatibility must be preserved during this MVP.
  - Recommended: preserve by keeping `sections` or adding a conversion helper, because the existing Nuxt portfolio imports `demoResume.sections`.
- Confirm whether the AI button/workflow should be removed from the editor screen for the MVP or simply hidden behind a future feature path.
  - Recommended: remove from the primary MVP workspace and leave the existing composable unused for later.
