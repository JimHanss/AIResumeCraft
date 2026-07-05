import type {
  EducationResumeModule,
  SkillsResumeModule,
  SummaryResumeModule,
} from '@airesumecraft/shared'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useResumeStore } from '../stores/resume'

vi.mock('../api/resume', () => ({
  getDemoResume: vi.fn(),
}))

describe('resume store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
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
})
