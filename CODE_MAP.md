# Code Map

## Workspace

- `apps/editor`: Vue 3 editor SPA.
- `apps/portfolio`: Nuxt 3 portfolio site and BFF routes.
- `packages/shared`: shared data schemas, fixtures, API route constants, and pure utilities.

## Editor MVP Flow

1. `apps/editor/src/main.ts` enables Pinia persistence, routing, i18n, Naive UI, Sentry, and optional MSW.
2. `apps/editor/src/components/ResumeWorkspace.vue` loads the resume store and lays out the editor.
3. `apps/editor/src/components/MaterialPanel.vue` exposes draggable module materials.
4. `apps/editor/src/components/ResumeCanvas.vue` accepts cloned materials and reorders canvas modules with `vuedraggable`.
5. `apps/editor/src/components/ModuleFrame.vue` provides selection, duplicate, remove, and drag handle controls.
6. `apps/editor/src/components/modules/moduleRegistry.ts` maps module types to editable Vue components.
7. `apps/editor/src/stores/resume.ts` is the state boundary for document data, selection, persistence, and module mutations.
8. `apps/editor/src/api/resume.ts` loads mockable resume data through the shared Axios client.
9. `apps/editor/src/mocks/handlers.ts` provides MSW responses for local mock mode.

## Shared Package

- `packages/shared/src/resume.ts`: Zod schemas and TypeScript types for resume documents, modules, sections, and scores.
- `packages/shared/src/fixtures.ts`: deterministic demo resume with both `modules` and legacy `sections`.
- `packages/shared/src/utils.ts`: id creation, ordering, cloning, default module creation, safe parsing, and score helpers.
- `packages/shared/src/api.ts`: shared route constants.

## Validation

```bash
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm test:e2e
pnpm build
```
