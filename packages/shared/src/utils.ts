import type {
  EducationResumeItem,
  ExperienceResumeItem,
  ResumeDocument,
  ResumeModule,
  ResumeModuleFor,
  ResumeModuleType,
  ResumeSection,
  SkillGroup,
} from './resume'
import { resumeDocumentSchema, resumeModuleSchema } from './resume'

export function uid(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

export function sortSections(sections: ResumeSection[]) {
  return [...sections].sort((left, right) => left.order - right.order)
}

export function reorderSections(sections: ResumeSection[]) {
  return sections.map((section, index) => ({
    ...section,
    order: index + 1,
  }))
}

export function sortModules(modules: ResumeModule[]) {
  return [...modules].sort((left, right) => left.order - right.order)
}

export function reorderModules(modules: ResumeModule[]) {
  return modules.map((module, index) => ({
    ...module,
    order: index + 1,
  }))
}

export function createResumeModule<T extends ResumeModuleType>(
  type: T,
): ResumeModuleFor<T> {
  const base = {
    id: uid(`module-${type}`),
    order: 1,
  }

  switch (type) {
    case 'avatar':
      return {
        ...base,
        type,
        title: 'Basic Info',
        content: {
          name: '',
          headline: '',
          email: '',
          phone: '',
          location: '',
          avatarUrl: '',
          profileUrl: '',
        },
      } as ResumeModuleFor<T>
    case 'summary':
      return {
        ...base,
        type,
        title: 'Summary',
        content: {
          text: '',
        },
      } as ResumeModuleFor<T>
    case 'education':
      return {
        ...base,
        type,
        title: 'Education',
        content: {
          items: [createEducationItem()],
        },
      } as ResumeModuleFor<T>
    case 'experience':
      return {
        ...base,
        type,
        title: 'Experience',
        content: {
          items: [createExperienceItem()],
        },
      } as ResumeModuleFor<T>
    case 'skills':
      return {
        ...base,
        type,
        title: 'Skills',
        content: {
          groups: [createSkillGroup()],
        },
      } as ResumeModuleFor<T>
  }
}

export function cloneResumeModule(module: ResumeModule) {
  const cloned = structuredClone(resumeModuleSchema.parse(module))
  cloned.id = uid(`module-${module.type}`)

  if (cloned.type === 'education') {
    cloned.content.items = cloned.content.items.map(item => ({
      ...item,
      id: uid('education'),
    }))
  }

  if (cloned.type === 'experience') {
    cloned.content.items = cloned.content.items.map(item => ({
      ...item,
      id: uid('experience'),
    }))
  }

  if (cloned.type === 'skills') {
    cloned.content.groups = cloned.content.groups.map(group => ({
      ...group,
      id: uid('skill-group'),
    }))
  }

  return cloned
}

export function createExperienceItem(): ExperienceResumeItem {
  return {
    id: uid('experience'),
    company: '',
    role: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
  }
}

export function createEducationItem(): EducationResumeItem {
  return {
    id: uid('education'),
    school: '',
    degree: '',
    field: '',
    location: '',
    startDate: '',
    endDate: '',
    gpa: '',
    honors: '',
    coursework: '',
    description: '',
  }
}

export function createSkillGroup(
  name = 'Core Skills',
  skills: string[] = [''],
): SkillGroup {
  return {
    id: uid('skill-group'),
    name,
    skills,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function stringValue(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function isPresentDate(value: unknown) {
  if (typeof value !== 'string')
    return false

  return ['present', 'current', 'now', '至今'].includes(
    value.trim().toLowerCase(),
  )
}

function migrateExperienceItem(item: unknown): ExperienceResumeItem | unknown {
  if (!isRecord(item))
    return item

  return {
    ...item,
    id: stringValue(item.id, uid('experience')),
    company: stringValue(item.company),
    role: stringValue(item.role),
    location: stringValue(item.location),
    startDate: stringValue(item.startDate),
    endDate: stringValue(item.endDate),
    current:
      typeof item.current === 'boolean'
        ? item.current
        : isPresentDate(item.endDate),
    description: stringValue(item.description),
  }
}

function migrateEducationItem(item: unknown): EducationResumeItem | unknown {
  if (!isRecord(item))
    return item

  return {
    ...item,
    id: stringValue(item.id, uid('education')),
    school: stringValue(item.school),
    degree: stringValue(item.degree),
    field: stringValue(item.field),
    location: stringValue(item.location),
    startDate: stringValue(item.startDate),
    endDate: stringValue(item.endDate),
    gpa: stringValue(item.gpa),
    honors: stringValue(item.honors),
    coursework: stringValue(item.coursework),
    description: stringValue(item.description),
  }
}

function migrateSkillGroup(group: unknown): SkillGroup | unknown {
  if (!isRecord(group))
    return group

  return {
    ...group,
    id: stringValue(group.id, uid('skill-group')),
    name: stringValue(group.name, 'Core Skills'),
    skills: Array.isArray(group.skills)
      ? group.skills.filter(
          (skill): skill is string => typeof skill === 'string',
        )
      : [''],
  }
}

function migrateResumeModule(module: unknown): unknown {
  if (!isRecord(module))
    return module

  const content = isRecord(module.content) ? module.content : {}

  if (module.type === 'avatar') {
    return {
      ...module,
      content: {
        ...content,
        profileUrl: stringValue(content.profileUrl),
      },
    }
  }

  if (module.type === 'education') {
    return {
      ...module,
      content: {
        ...content,
        items: Array.isArray(content.items)
          ? content.items.map(migrateEducationItem)
          : [createEducationItem()],
      },
    }
  }

  if (module.type === 'experience') {
    return {
      ...module,
      content: {
        ...content,
        items: Array.isArray(content.items)
          ? content.items.map(migrateExperienceItem)
          : [createExperienceItem()],
      },
    }
  }

  if (module.type === 'skills') {
    const legacySkills = content.skills
    const groups = Array.isArray(content.groups)
      ? content.groups.map(migrateSkillGroup)
      : [
          createSkillGroup(
            'Core Skills',
            Array.isArray(legacySkills)
              ? legacySkills.filter(
                  (skill): skill is string => typeof skill === 'string',
                )
              : [''],
          ),
        ]

    return {
      ...module,
      content: {
        ...content,
        groups,
      },
    }
  }

  return module
}

function migrateResumeDocument(input: unknown): unknown {
  if (!isRecord(input) || !Array.isArray(input.modules))
    return input

  return {
    ...input,
    modules: input.modules.map(migrateResumeModule),
  }
}

export function safeResumeDocument(input: unknown, fallback: ResumeDocument) {
  const parsed = resumeDocumentSchema.safeParse(migrateResumeDocument(input))
  if (parsed.success)
    return parsed.data

  return structuredClone(fallback)
}

export function calculateOverallScore(document: Pick<ResumeDocument, 'score'>) {
  const values = Object.values(document.score)
  return Math.round(
    values.reduce((total, value) => total + value, 0) / values.length,
  )
}
