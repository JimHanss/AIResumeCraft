import { describe, expect, it } from 'vitest'
import { calculateOverallScore, reorderSections } from './utils'

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
})
