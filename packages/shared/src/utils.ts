import type { ResumeDocument, ResumeSection } from './resume'

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

export function calculateOverallScore(document: Pick<ResumeDocument, 'score'>) {
  const values = Object.values(document.score)
  return Math.round(
    values.reduce((total, value) => total + value, 0) / values.length,
  )
}
