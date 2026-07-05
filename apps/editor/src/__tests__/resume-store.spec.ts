import type { SummaryResumeModule } from '@airesumecraft/shared'
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

  it('falls back to the default resume for invalid persisted data', () => {
    const store = useResumeStore()

    store.restoreDocument({ invalid: true })

    expect(store.document.id).toBe('demo-resume')
    expect(store.orderedModules).toHaveLength(4)
    expect(store.selectedModuleId).toBe(store.orderedModules[0].id)
  })
})
