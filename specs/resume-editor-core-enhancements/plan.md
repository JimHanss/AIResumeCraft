# Resume Editor Core Enhancements Plan

## Scope Decisions

- Add an `education` resume module in this feature.
- Implement grouped skills editing in the first pass instead of keeping a flat skill tag list.
- Keep the avatar/basic-info block fixed in the resume preview header. Right-side drag ordering applies to resume body modules: summary, education, experience, and skills.
- This plan only covers the technical implementation path. Product code is not changed in this planning step.

## Affected Files And Modules

- `packages/shared/src/resume.ts`
  - Extend `resumeModuleTypeSchema` with `education`.
  - Add `educationResumeModuleSchema`.
  - Extend `avatarResumeModuleSchema` with profile link fields.
  - Extend `experienceResumeModuleSchema` with `location` and `current`.
  - Replace flat skills content with grouped skills content.
  - Export new inferred types.
- `packages/shared/src/utils.ts`
  - Add `createEducationItem`.
  - Add `createSkillGroup`.
  - Update `createResumeModule`, `cloneResumeModule`, and migration helpers.
  - Improve safe parsing/migration for old persisted flat skills and old experience items.
- `packages/shared/src/fixtures.ts`
  - Add demo education module and section content.
  - Update skills fixture to grouped data.
  - Add basic-info profile link sample.
- `packages/shared/src/utils.spec.ts`
  - Add tests for education creation, grouped skills creation, and old document migration.
- `apps/editor/src/stores/resume.ts`
  - Add `education` to material definitions.
  - Ensure toggles, add-first-inactive, duplicate, remove-by-type, and reorder work with the fifth module.
  - Keep `syncProfileFromAvatar` aligned with new avatar profile-link fields.
- `apps/editor/src/components/forms/FieldControl.vue` (new)
  - Reusable title-and-input wrapper with label, optional hint, optional error slot, and default slot for Naive input controls.
- `apps/editor/src/components/forms/FieldGrid.vue` (optional new)
  - Shared responsive grid wrapper for common two-column field layouts.
- `apps/editor/src/components/modules/AvatarModule.vue`
  - Migrate fields to `FieldControl`.
  - Add profile link input.
- `apps/editor/src/components/modules/SummaryModule.vue`
  - Wrap summary textarea in `FieldControl`.
- `apps/editor/src/components/modules/ExperienceModule.vue`
  - Migrate fields to `FieldControl`.
  - Add location and current-role controls.
  - Keep description as multiline bullet input initially.
- `apps/editor/src/components/modules/EducationModule.vue` (new)
  - Add school, degree, field of study, location, start/end dates, GPA/honors/coursework/details fields.
- `apps/editor/src/components/modules/SkillsModule.vue`
  - Replace flat `NDynamicTags` with grouped skill editors.
  - Each group has group name/category and dynamic skill tags/items.
- `apps/editor/src/components/modules/moduleRegistry.ts`
  - Register `EducationModule`.
  - Keep `Record<ResumeModuleType, Component>` exhaustive.
- `apps/editor/src/components/MaterialPanel.vue`
  - Add education icon and material row.
- `apps/editor/src/components/ModuleFrame.vue`
  - Replace `::` drag affordance with a four-direction move icon.
  - Prefer an existing icon dependency if available; otherwise use a CSS/icon text fallback with accessible title.
- `apps/editor/src/components/ResumeCanvas.vue`
  - Reuse the updated drag handle and field components without changing the store contract.
- `apps/editor/src/components/ResumePreview.vue`
  - Convert body preview modules to `vuedraggable`.
  - Add education rendering.
  - Add grouped skills rendering.
  - Keep header/basic info outside body drag list.
- `apps/editor/src/composables/useDragSelectionGuard.ts`
  - Reuse for preview drag start/end.
- `apps/editor/src/i18n/index.ts`
  - Add zh-CN and en-US labels for education, profile link, grouped skills, current role, school, degree, major, GPA, honors, coursework, and preview drag affordance.
- `apps/editor/src/styles.css`
  - Add field component styles.
  - Add grouped skills editor styles.
  - Add preview draggable state and body module handle styles.
  - Adjust mobile layout for new fields and preview drag handle.
- `apps/editor/src/__tests__/resume-store.spec.ts`
  - Update expected default module count from 4 to 5.
  - Add education add/update tests.
  - Add grouped skills update tests.
  - Add preview-compatible reorder tests.
- `tests/e2e/editor.spec.ts`
  - Update material list to include education.
  - Add field editing and persistence assertions for education and grouped skills.
  - Add preview body module drag reorder coverage.
- `CODE_MAP.md`, `PROJECT_PROGRESS.md`, and `README.md`
  - Document the new module, grouped skills structure, and validation commands after implementation.

## Architecture And Data Flow

The resume document remains the single source of truth in `useResumeStore.document`.

1. Shared schemas define all valid resume module shapes.
2. `demoResume` and `createResumeModule` provide safe defaults for new documents and new module instances.
3. `safeResumeDocument` validates persisted or mocked documents and should migrate older compatible documents before falling back.
4. The left material panel creates modules through `store.createModule`.
5. The middle editor and right preview both read `store.orderedModules`.
6. The middle editor reorders all modules through `store.reorderModules`.
7. The right preview reorders body modules through a computed setter that merges reordered body modules back with the fixed avatar module and calls `store.reorderModules`.
8. Module forms emit partial content patches through `store.updateModule(id, patch)`.
9. Pinia persisted state writes document changes to localStorage.

Recommended preview reorder model:

```ts
const bodyModules = computed({
  get: () => store.orderedModules.filter(module => module.type !== 'avatar'),
  set: (modules) => {
    const avatarModules = store.orderedModules.filter(
      module => module.type === 'avatar',
    )
    store.reorderModules([...avatarModules, ...modules])
  },
})
```

If multiple avatar modules exist, keep all avatar modules before body modules in preview ordering to preserve the fixed resume header assumption.

## Data Model Changes

### Module Types

Add:

```text
type ResumeModuleType =
  | 'avatar'
  | 'summary'
  | 'education'
  | 'experience'
  | 'skills'
```

### Basic Information

Extend avatar content:

```text
{
  name: string
  headline: string
  email: string
  phone?: string
  location?: string
  avatarUrl?: string
  profileUrl?: string
}
```

### Education

Add module content:

```text
{
  items: Array<{
    id: string
    school: string
    degree: string
    field: string
    location?: string
    startDate?: string
    endDate?: string
    gpa?: string
    honors?: string
    coursework?: string
    description?: string
  }>
}
```

### Experience

Extend item content:

```text
{
  id: string
  company: string
  role: string
  location?: string
  startDate?: string
  endDate?: string
  current?: boolean
  description: string
}
```

The preview should display localized `Present` when `current` is true.

### Skills

Replace flat skills with grouped skills:

```text
{
  groups: Array<{
    id: string
    name: string
    skills: string[]
  }>
}
```

Migration should convert old `{ skills: string[] }` to:

```text
{
  groups: [
    {
      id: uid('skill-group'),
      name: 'Core Skills',
      skills: oldSkills,
    },
  ],
}
```

## API Or Interface Changes

- No backend API changes are required.
- No AI API changes are required.
- MSW handlers can continue returning `demoResume`, but the fixture shape must include education and grouped skills.
- Public TypeScript exports from `@airesumecraft/shared` change because `ResumeModuleType`, `ResumeModule`, and `SkillsResumeModule` expand.
- Store method signatures can remain unchanged:
  - `addModule(type, afterId?)`
  - `createModule(type)`
  - `updateModule(id, patch)`
  - `reorderModules(modules)`
  - `toggleModuleType(type, enabled)`
- E2E test selectors should add stable ids:
  - `material-education`
  - `education-school-input`
  - `skill-group-name-input`
  - `preview-module`
  - `preview-module-drag`

## Implementation Steps

1. Update shared schemas and types.
   - Add education module schema.
   - Extend avatar and experience schemas.
   - Change skills schema to grouped data.
   - Export `EducationResumeModule` and new item/group helper types if useful.
2. Add shared creators and migration.
   - Add `createEducationItem` and `createSkillGroup`.
   - Update `createResumeModule` for education and grouped skills.
   - Update `cloneResumeModule` to regenerate nested education and skill group ids.
   - Add a migration path before `resumeDocumentSchema.safeParse` so old persisted documents do not wipe user drafts unnecessarily.
3. Update fixtures.
   - Add `module-education` between summary and experience.
   - Convert demo skills to grouped categories such as `Frontend`, `AI/Product`, and `Tools`.
   - Add profile link to avatar content.
4. Update editor store material definitions.
   - Add education material.
   - Keep add/toggle/remove behavior generic by type.
5. Add reusable field components.
   - Create `FieldControl.vue` with label/title, optional hint, and slotted input.
   - Add `FieldGrid.vue` only if repeated two-column layout is needed across modules.
6. Migrate module forms.
   - Basic information: name, headline, phone, email, location, profile URL, avatar URL.
   - Summary: textarea wrapped in `FieldControl`.
   - Experience: company, role, location, start/end, current, description bullets.
   - Education: school, degree, field, location, start/end, GPA, honors, coursework/details.
   - Skills: grouped editor with add/remove group and dynamic tags per group.
7. Register education module.
   - Add `EducationModule.vue`.
   - Update `moduleRegistry.ts`.
   - Update `MaterialPanel.vue` icons and i18n.
8. Improve drag handles.
   - Replace the text `::` handle with a four-direction move icon in `ModuleFrame.vue`.
   - Keep accessible `title` and visual focus styles.
9. Add preview drag ordering.
   - Wrap body module preview sections with `Draggable`.
   - Use the same drag selection guard.
   - Render education and grouped skills.
   - Add preview drag handle or make section header the handle; prefer an explicit small handle so text remains selectable outside drag interactions.
10. Update styles.

- Add field, group, education item, and preview drag styles.
- Verify desktop and mobile layouts do not overflow.

11. Update i18n.

- Add all new field labels and module labels in zh-CN and en-US.
- Keep the current ASCII `\uXXXX` style for Chinese strings if editing via PowerShell remains risky.

12. Update tests.

- Shared utility tests for new creators and migration.
- Store tests for five default modules, education add/update, grouped skills updates, and reorder.
- E2E tests for editor load, education fields, grouped skills, preview drag reorder, and persistence.

13. Update docs after implementation.

- Update code map and progress docs with education and grouped skills data model.
- Update README run/verification notes only if commands change.

## Risks

- Persisted localStorage documents with the old flat skills shape will fail schema parsing unless migration is added.
- Changing `SkillsResumeModule['content']` from `skills` to `groups` touches editor forms, preview rendering, tests, and fixtures at once.
- Adding `education` to `ResumeModuleType` will make exhaustive `Record<ResumeModuleType, ...>` declarations fail until every registry/icon/i18n branch is updated.
- Preview drag ordering must avoid accidentally moving avatar/basic info into the body list if the header remains fixed.
- Naive UI wrapped inputs need stable nested input locators in E2E, or explicit test ids on wrappers plus `.locator('input')`.
- Chinese i18n literals have already been prone to encoding issues in PowerShell; use UTF-8 without BOM or escaped Unicode consistently.
- Current worktree is already dirty with Yarn migration and UI updates; implementation should avoid reverting unrelated changes.

## Validation Commands

Run after implementation:

```bash
corepack yarn lint
corepack yarn typecheck
corepack yarn test:unit
corepack yarn test:e2e
corepack yarn build
```

Recommended focused checks while implementing:

```bash
corepack yarn workspace @airesumecraft/editor test:unit
corepack yarn workspace @airesumecraft/editor typecheck
corepack yarn workspace @airesumecraft/editor dev
```

Browser verification:

- Desktop viewport around `1872x1009`: verify left material list has education, middle editor has title/input fields, preview body modules drag in sync.
- Mobile viewport around `390x844`: verify field labels, grouped skills, preview body, and drag handles do not overlap or cause horizontal overflow.

## Documentation Updates Required

- Update `CODE_MAP.md` with the new education module and field component locations.
- Update `PROJECT_PROGRESS.md` with the completed enhancement milestone after verification.
- Update `README.md` only if the user-facing module list or local validation workflow needs to mention education/grouped skills.
- Update `specs/resume-editor-core-enhancements/spec.md` in a later spec update step if strict spec alignment is required, because this plan records user-confirmed decisions that resolve the current clarification questions.

## Confirmation Needed

None. The user confirmed:

- Add the education module.
- Build grouped skills editing in the first pass.
