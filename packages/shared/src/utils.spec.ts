import { describe, expect, it } from 'vitest'
import { demoResume } from './fixtures'
import {
  calculateOverallScore,
  createResumeModule,
  reorderModules,
  reorderSections,
  safeResumeDocument,
} from './utils'

describe('resume utilities', () => {
  it('normalizes section order', () => {
    const sections = reorderSections([
      {
        id: 'b',
        type: 'skills',
        title: 'Skills',
        markdown: '',
        order: 10,
      },
      {
        id: 'a',
        type: 'summary',
        title: 'Summary',
        markdown: '',
        order: 3,
      },
    ])

    expect(sections.map((section) => section.order)).toEqual([1, 2])
  })

  it('calculates an overall score', () => {
    expect(
      calculateOverallScore({
        score: {
          impact: 80,
          clarity: 90,
          relevance: 70,
          ats: 100,
        },
      }),
    ).toBe(85)
  })

  it('creates distinct resume modules', () => {
    const first = createResumeModule('summary')
    const second = createResumeModule('summary')

    expect(first.type).toBe('summary')
    expect(first.id).not.toBe(second.id)
  })

  it('normalizes module order', () => {
    const modules = reorderModules([
      { ...createResumeModule('summary'), order: 10 },
      { ...createResumeModule('skills'), order: 4 },
    ])

    expect(modules.map((module) => module.order)).toEqual([1, 2])
  })

  it('falls back for invalid resume documents', () => {
    expect(safeResumeDocument({ invalid: true }, demoResume)).toEqual(
      demoResume,
    )
  })
})
