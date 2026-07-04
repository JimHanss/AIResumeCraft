import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useResumeStore } from '../stores/resume'

describe('resume store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('keeps sections ordered after replacement', () => {
    const store = useResumeStore()
    const reversed = [...store.orderedSections].reverse()

    store.replaceSections(reversed)

    expect(store.orderedSections[0].order).toBe(1)
    expect(store.orderedSections).toHaveLength(reversed.length)
  })
})
