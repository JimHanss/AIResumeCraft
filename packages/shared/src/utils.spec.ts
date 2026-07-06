import { describe, expect, it } from 'vitest'
import { demoResume } from './fixtures'
import {
  calculateOverallScore,
  cloneResumeModule,
  createCustomField,
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

    expect(sections.map(section => section.order)).toEqual([1, 2])
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

  it('creates an education module with a default item', () => {
    const module = createResumeModule('education')

    expect(module.type).toBe('education')
    expect(module.content.items).toHaveLength(1)
    expect(module.content.items[0].school).toBe('')
  })

  it('creates grouped skills by default', () => {
    const module = createResumeModule('skills')

    expect(module.type).toBe('skills')
    expect(module.content.groups).toHaveLength(1)
    expect(module.content.groups[0].skills).toEqual([''])
  })

  it('creates a custom module with default fields', () => {
    const module = createResumeModule('custom')

    expect(module.type).toBe('custom')
    expect(module.content.fields).toHaveLength(1)
    expect(module.content.fields[0].type).toBe('text')
    expect(module.content.fields[0].span).toBe(12)
  })

  it('creates custom fields with type-specific defaults', () => {
    const text = createCustomField('text')
    const textarea = createCustomField('textarea')
    const list = createCustomField('list')

    expect(text.value).toBe('')
    expect(textarea.value).toBe('')
    expect(textarea.minRows).toBe(3)
    expect(list.items).toHaveLength(1)
  })

  it('normalizes module order', () => {
    const modules = reorderModules([
      { ...createResumeModule('summary'), order: 10 },
      { ...createResumeModule('skills'), order: 4 },
    ])

    expect(modules.map(module => module.order)).toEqual([1, 2])
  })

  it('migrates legacy flat skills into grouped skills', () => {
    const legacy = structuredClone(demoResume) as unknown as {
      modules: Array<{
        type?: unknown
        content?: Record<string, unknown>
      }>
    }
    const skills = legacy.modules.find(module => module.type === 'skills')

    expect(skills).toBeDefined()
    skills!.content = {
      skills: ['Vue', 'Testing'],
    }

    const migrated = safeResumeDocument(legacy, demoResume)
    const migratedSkills = migrated.modules.find(
      module => module.type === 'skills',
    )

    expect(migratedSkills?.type).toBe('skills')
    if (migratedSkills?.type === 'skills') {
      expect(migratedSkills.content.groups[0].name).toBe('Core Skills')
      expect(migratedSkills.content.groups[0].skills).toEqual([
        'Vue',
        'Testing',
      ])
    }
  })

  it('migrates defaults for legacy avatar and experience modules', () => {
    const legacy = structuredClone(demoResume) as unknown as {
      modules: Array<{
        type?: unknown
        content?: Record<string, unknown>
      }>
    }
    const avatar = legacy.modules.find(module => module.type === 'avatar')
    const experience = legacy.modules.find(
      module => module.type === 'experience',
    )

    expect(avatar).toBeDefined()
    expect(experience).toBeDefined()

    avatar!.content = {
      name: 'Legacy User',
      headline: 'Legacy Headline',
      email: 'legacy@example.com',
      phone: '',
      location: 'Shanghai',
      avatarUrl: '',
    }
    experience!.content = {
      items: [
        {
          id: 'legacy-experience',
          company: 'Legacy Co',
          role: 'Engineer',
          startDate: '2020',
          endDate: 'Present',
          description: 'Built migration coverage.',
        },
      ],
    }

    const migrated = safeResumeDocument(legacy, demoResume)
    const migratedAvatar = migrated.modules.find(
      module => module.type === 'avatar',
    )
    const migratedExperience = migrated.modules.find(
      module => module.type === 'experience',
    )

    expect(migratedAvatar?.type).toBe('avatar')
    if (migratedAvatar?.type === 'avatar')
      expect(migratedAvatar.content.profileUrl).toBe('')

    expect(migratedExperience?.type).toBe('experience')
    if (migratedExperience?.type === 'experience') {
      expect(migratedExperience.content.items[0].location).toBe('')
      expect(migratedExperience.content.items[0].current).toBe(true)
    }
  })

  it('migrates legacy custom module fields', () => {
    const legacy = structuredClone(demoResume) as unknown as {
      modules: unknown[]
    }
    legacy.modules.push({
      id: 'legacy-custom',
      type: 'custom',
      title: 'Certificates',
      order: 6,
      content: {
        fields: [
          {
            type: 'text',
            label: 'Issuer',
            value: 'Cloud Native Foundation',
          },
          {
            type: 'list',
            label: 'Items',
            items: ['CKA', { text: 'CKAD' }],
            span: 6,
          },
        ],
      },
    })

    const migrated = safeResumeDocument(legacy, demoResume)
    const custom = migrated.modules.find(module => module.type === 'custom')

    expect(custom?.type).toBe('custom')
    if (custom?.type === 'custom') {
      expect(custom.content.fields).toHaveLength(2)
      expect(custom.content.fields[0].id).toBeTruthy()
      expect(custom.content.fields[0].order).toBe(1)
      expect(custom.content.fields[0].span).toBe(12)
      expect(custom.content.fields[1].type).toBe('list')
      if (custom.content.fields[1].type === 'list') {
        expect(custom.content.fields[1].items.map(item => item.text)).toEqual(
          ['CKA', 'CKAD'],
        )
      }
    }
  })

  it('clones custom module nested ids', () => {
    const module = createResumeModule('custom')
    module.content.fields = [
      createCustomField('list', {
        label: 'Awards',
        items: [{ id: 'custom-list-item-original', text: 'Winner' }],
      }),
    ]

    const cloned = cloneResumeModule(module)

    expect(cloned.type).toBe('custom')
    if (cloned.type === 'custom') {
      expect(cloned.id).not.toBe(module.id)
      expect(cloned.content.fields[0].id).not.toBe(module.content.fields[0].id)
      expect(cloned.content.fields[0].type).toBe('list')
      if (cloned.content.fields[0].type === 'list') {
        expect(cloned.content.fields[0].items[0].id).not.toBe(
          'custom-list-item-original',
        )
      }
    }
  })

  it('falls back for invalid resume documents', () => {
    expect(safeResumeDocument({ invalid: true }, demoResume)).toEqual(
      demoResume,
    )
  })
})
