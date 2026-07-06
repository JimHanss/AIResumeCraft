import type {
  CustomResumeModule,
  EducationResumeModule,
  SkillsResumeModule,
  SummaryResumeModule,
} from '@airesumecraft/shared'
import { createCustomField, demoResume } from '@airesumecraft/shared'
import { createPinia, setActivePinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick } from 'vue'
import { defaultPreferences, useResumeStore } from '../stores/resume'

vi.mock('../api/resume', () => ({
  getDemoResume: vi.fn(),
}))

function createActivePinia() {
  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)
  createApp({}).use(pinia)
  setActivePinia(pinia)
}

describe('resume store', () => {
  beforeEach(() => {
    localStorage.clear()
    createActivePinia()
  })

  it('adds material modules with distinct ids', () => {
    const store = useResumeStore()

    const first = store.addModule('summary')
    const second = store.addModule('summary')

    expect(first?.type).toBe('summary')
    expect(second?.type).toBe('summary')
    expect(first?.id).not.toBe(second?.id)
    expect(store.orderedModules.at(-1)?.id).toBe(second?.id)
  })

  it('keeps modules ordered after replacement', () => {
    const store = useResumeStore()
    const reversed = [...store.orderedModules].reverse()

    store.reorderModules(reversed)

    expect(store.orderedModules[0].order).toBe(1)
    expect(store.orderedModules.map(module => module.order)).toEqual([
      1,
      2,
      3,
      4,
      5,
    ])
  })

  it('updates only the targeted module content', () => {
    const store = useResumeStore()
    const summary = store.orderedModules.find(
      (module): module is SummaryResumeModule => module.type === 'summary',
    )
    const skillsBefore = store.orderedModules.find(
      module => module.type === 'skills',
    )

    expect(summary).toBeDefined()
    store.updateModule(summary!.id, { text: 'Updated summary' })

    const updatedSummary = store.orderedModules.find(
      (module): module is SummaryResumeModule => module.id === summary!.id,
    )
    const skillsAfter = store.orderedModules.find(
      module => module.type === 'skills',
    )

    expect(updatedSummary?.content.text).toBe('Updated summary')
    expect(skillsAfter).toEqual(skillsBefore)
  })

  it('renames modules without accepting blank titles', () => {
    const store = useResumeStore()
    const summary = store.orderedModules.find(
      (module): module is SummaryResumeModule => module.type === 'summary',
    )

    expect(summary).toBeDefined()
    expect(store.renameModule(summary!.id, 'Role Snapshot')).toBe(true)
    expect(
      store.orderedModules.find(module => module.id === summary!.id)?.title,
    ).toBe('Role Snapshot')

    expect(store.renameModule(summary!.id, '   ')).toBe(false)
    expect(
      store.orderedModules.find(module => module.id === summary!.id)?.title,
    ).toBe('Role Snapshot')
  })

  it('adds, updates, duplicates, and removes education modules', () => {
    const store = useResumeStore()
    const education = store.addModule('education')

    expect(education?.type).toBe('education')
    if (education?.type !== 'education')
      return

    store.updateModule(education.id, {
      items: [
        {
          ...education.content.items[0],
          school: 'Playwright University',
        },
      ],
    })

    const updated = store.orderedModules.find(
      (module): module is EducationResumeModule => module.id === education.id,
    )

    expect(updated?.content.items[0].school).toBe('Playwright University')

    const duplicate = store.duplicateModule(education.id)
    expect(duplicate?.type).toBe('education')
    expect(duplicate?.id).not.toBe(education.id)

    store.removeModule(education.id)
    expect(
      store.orderedModules.some(module => module.id === education.id),
    ).toBe(false)
  })

  it('updates grouped skills content', () => {
    const store = useResumeStore()
    const skills = store.orderedModules.find(
      (module): module is SkillsResumeModule => module.type === 'skills',
    )

    expect(skills).toBeDefined()
    store.updateModule(skills!.id, {
      groups: [
        {
          id: 'test-skill-group',
          name: 'Testing',
          skills: ['Playwright', 'Vitest'],
        },
      ],
    })

    const updated = store.orderedModules.find(
      (module): module is SkillsResumeModule => module.id === skills!.id,
    )

    expect(updated?.content.groups[0].name).toBe('Testing')
    expect(updated?.content.groups[0].skills).toEqual(['Playwright', 'Vitest'])
  })

  it('adds and updates custom modules', () => {
    const store = useResumeStore()
    const module = store.addCustomModule({
      title: 'Certificates',
      content: {
        fields: [
          createCustomField('text', {
            label: 'Name',
            value: 'CKA',
          }),
        ],
      },
    })

    expect(module?.type).toBe('custom')
    expect(store.selectedModuleId).toBe(module?.id)

    store.updateModule(module!.id, {
      fields: [
        createCustomField('text', {
          id: module!.content.fields[0].id,
          label: 'Name',
          value: 'CKAD',
        }),
      ],
    })

    const updated = store.orderedModules.find(
      (item): item is CustomResumeModule => item.id === module!.id,
    )

    expect(updated?.content.fields[0].type).toBe('text')
    if (updated?.content.fields[0].type === 'text')
      expect(updated.content.fields[0].value).toBe('CKAD')
  })

  it('replaces custom module structure without changing module id', () => {
    const store = useResumeStore()
    const module = store.addCustomModule({
      title: 'Projects',
      content: {
        fields: [
          createCustomField('text', {
            label: 'Project',
            value: 'AIResumeCraft',
          }),
        ],
      },
    })

    expect(module?.type).toBe('custom')
    const result = store.replaceCustomModuleSchema(module!.id, {
      title: 'Project Highlights',
      content: {
        fields: [
          {
            ...module!.content.fields[0],
            label: 'Project name',
            span: 12,
          },
          createCustomField('list', {
            label: 'Bullets',
            span: 12,
          }),
        ],
      },
    })

    expect(result).toBe(true)
    const updated = store.orderedModules.find(
      (item): item is CustomResumeModule => item.id === module!.id,
    )

    expect(updated?.title).toBe('Project Highlights')
    expect(updated?.content.fields).toHaveLength(2)
    expect(updated?.content.fields[0].id).toBe(module!.content.fields[0].id)
  })

  it('undoes and redoes custom module changes', () => {
    const store = useResumeStore()
    const module = store.addCustomModule({
      title: 'Awards',
      content: {
        fields: [createCustomField('text', { label: 'Award' })],
      },
    })

    expect(module?.type).toBe('custom')
    expect(store.orderedModules.some(item => item.id === module!.id)).toBe(
      true,
    )

    expect(store.undo()).toBe(true)
    expect(store.orderedModules.some(item => item.id === module!.id)).toBe(
      false,
    )

    expect(store.redo()).toBe(true)
    expect(store.orderedModules.some(item => item.id === module!.id)).toBe(
      true,
    )
  })

  it('keeps multiple custom modules independent', () => {
    const store = useResumeStore()
    const first = store.addCustomModule({
      title: 'Certificates',
      content: { fields: [createCustomField('text', { label: 'Name' })] },
    })
    const second = store.addCustomModule({
      title: 'Awards',
      content: { fields: [createCustomField('text', { label: 'Award' })] },
    })

    expect(first?.type).toBe('custom')
    expect(second?.type).toBe('custom')
    expect(first?.id).not.toBe(second?.id)

    store.removeModule(first!.id)

    expect(store.orderedModules.some(module => module.id === first!.id)).toBe(
      false,
    )
    expect(
      store.orderedModules.some(module => module.id === second!.id),
    ).toBe(true)
  })

  it('supports preview-style body module reordering', () => {
    const store = useResumeStore()
    const avatarModules = store.orderedModules.filter(
      module => module.type === 'avatar',
    )
    const bodyModules = store.orderedModules.filter(
      module => module.type !== 'avatar',
    )

    store.reorderModules([...avatarModules, ...bodyModules.reverse()])

    expect(store.orderedModules[0].type).toBe('avatar')
    expect(store.orderedModules.map(module => module.order)).toEqual([
      1,
      2,
      3,
      4,
      5,
    ])
  })

  it('supports transient preview ordering while dragging modules', () => {
    const store = useResumeStore()
    const originalIds = store.orderedModules.map(module => module.id)
    const transientIds = [...originalIds]
    const movedId = transientIds.splice(1, 1)[0]

    expect(movedId).toBeDefined()
    transientIds.push(movedId!)
    store.setDragPreviewModuleOrder(transientIds)

    expect(store.previewOrderedModules.map(module => module.id)).toEqual(
      transientIds,
    )
    expect(store.orderedModules.map(module => module.id)).toEqual(originalIds)

    store.clearDragPreviewModuleOrder()

    expect(store.previewOrderedModules.map(module => module.id)).toEqual(
      originalIds,
    )
  })

  it('falls back to the default resume for invalid persisted data', () => {
    const store = useResumeStore()

    store.restoreDocument({ invalid: true })

    expect(store.document.id).toBe('demo-resume')
    expect(store.orderedModules).toHaveLength(5)
    expect(store.selectedModuleId).toBe(store.orderedModules[0].id)
  })

  it('initializes complete default editor preferences', () => {
    const store = useResumeStore()

    expect(store.preferences).toEqual(defaultPreferences)
  })

  it('normalizes older persisted preferences with only dark mode', async () => {
    const store = useResumeStore()

    store.preferences = { darkMode: true } as typeof store.preferences
    await nextTick()

    expect(store.preferences.darkMode).toBe(true)
    expect(store.preferences.resumeThemeId).toBe(
      defaultPreferences.resumeThemeId,
    )
    expect(store.preferences.previewFontSize).toBe(
      defaultPreferences.previewFontSize,
    )
    expect(store.preferences.exportQuality).toBe(
      defaultPreferences.exportQuality,
    )
  })

  it('updates theme preferences without changing module order', () => {
    const store = useResumeStore()
    const beforeOrder = store.orderedModules.map(module => module.id)

    expect(store.setResumeTheme('modern-sky')).toBe(true)

    expect(store.preferences.resumeThemeId).toBe('modern-sky')
    expect(store.orderedModules.map(module => module.id)).toEqual(beforeOrder)
  })

  it('updates persisted preview typography and export quality settings', () => {
    const store = useResumeStore()

    store.setPreviewFontFamily('serif')
    store.setPreviewFontSize(16)
    store.setPreviewLineHeight(1.8)
    store.setPreviewAccentColor('#2563eb')
    store.setExportQuality('high')

    expect(store.preferences.previewFontFamily).toBe('serif')
    expect(store.preferences.previewFontSize).toBe(16)
    expect(store.preferences.previewLineHeight).toBe(1.8)
    expect(store.preferences.previewAccentColor).toBe('#2563eb')
    expect(store.preferences.exportQuality).toBe('high')
  })

  it('undoes and redoes content edits', () => {
    const store = useResumeStore()
    const summary = store.orderedModules.find(
      (module): module is SummaryResumeModule => module.type === 'summary',
    )

    expect(summary).toBeDefined()
    const originalText = summary!.content.text

    store.updateModule(summary!.id, { text: 'Undoable summary' })
    expect(store.canUndo).toBe(true)
    expect(
      (
        store.orderedModules.find(
          module => module.id === summary!.id,
        ) as SummaryResumeModule
      ).content.text,
    ).toBe('Undoable summary')

    expect(store.undo()).toBe(true)
    expect(
      (
        store.orderedModules.find(
          module => module.id === summary!.id,
        ) as SummaryResumeModule
      ).content.text,
    ).toBe(originalText)

    expect(store.redo()).toBe(true)
    expect(
      (
        store.orderedModules.find(
          module => module.id === summary!.id,
        ) as SummaryResumeModule
      ).content.text,
    ).toBe('Undoable summary')
  })

  it('undoes and redoes module reorder changes', () => {
    const store = useResumeStore()
    const originalIds = store.orderedModules.map(module => module.id)

    store.reorderModules([...store.orderedModules].reverse())
    expect(store.orderedModules.map(module => module.id)).not.toEqual(
      originalIds,
    )

    expect(store.undo()).toBe(true)
    expect(store.orderedModules.map(module => module.id)).toEqual(originalIds)

    expect(store.redo()).toBe(true)
    expect(store.orderedModules.map(module => module.id)).toEqual(
      [...originalIds].reverse(),
    )
  })

  it('restores removed modules through undo', () => {
    const store = useResumeStore()
    const removedId = store.orderedModules[1]!.id

    store.removeModule(removedId)
    expect(store.orderedModules.some(module => module.id === removedId)).toBe(
      false,
    )

    expect(store.undo()).toBe(true)
    expect(store.orderedModules.some(module => module.id === removedId)).toBe(
      true,
    )
  })

  it('undoes and redoes theme preference changes without touching content', () => {
    const store = useResumeStore()
    const documentBefore = JSON.parse(JSON.stringify(store.document))

    store.setResumeTheme('mono-compact')
    expect(store.preferences.resumeThemeId).toBe('mono-compact')

    expect(store.undo()).toBe(true)
    expect(store.preferences.resumeThemeId).toBe(
      defaultPreferences.resumeThemeId,
    )
    expect(store.document).toEqual(documentBefore)

    expect(store.redo()).toBe(true)
    expect(store.preferences.resumeThemeId).toBe('mono-compact')
    expect(store.document).toEqual(documentBefore)
  })

  it('clears redo history when editing after undo', () => {
    const store = useResumeStore()
    const summary = store.orderedModules.find(
      (module): module is SummaryResumeModule => module.type === 'summary',
    )

    expect(summary).toBeDefined()

    store.updateModule(summary!.id, { text: 'First branch' })
    store.updateModule(summary!.id, { text: 'Second branch' })
    expect(store.undo()).toBe(true)
    expect(store.canRedo).toBe(true)

    store.updateModule(summary!.id, { text: 'New branch' })
    expect(store.canRedo).toBe(false)
  })

  it('does not persist undo history stacks', () => {
    const store = useResumeStore()

    store.restoreDocument(demoResume)
    store.setResumeTheme('modern-sky')
    store.undo()

    expect(Object.keys(store.$state)).not.toContain('pastSnapshots')
    expect(Object.keys(store.$state)).not.toContain('futureSnapshots')
  })
})
