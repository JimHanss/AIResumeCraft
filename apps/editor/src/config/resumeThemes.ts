export const resumeThemeIds = [
  'classic-blue',
  'modern-sky',
  'mono-compact',
] as const

export type ResumeThemeId = (typeof resumeThemeIds)[number]

export type ResumeThemeLabelKey = `editor.theme.${string}`

export type ResumeThemeCssVars = Record<`--preview-${string}`, string>

export type ResumeThemePreviewFontFamily = 'sans' | 'inter' | 'serif'

export interface ResumeThemePreviewDefaults {
  previewAccentColor?: string
  previewFontFamily?: ResumeThemePreviewFontFamily
  previewFontSize?: number
  previewLineHeight?: number
}

export interface ResumeThemeDefinition {
  cssVars: ResumeThemeCssVars
  defaults: ResumeThemePreviewDefaults
  id: ResumeThemeId
  labelKey: ResumeThemeLabelKey
}

export const defaultResumeThemeId: ResumeThemeId = 'classic-blue'

export const resumeThemes = [
  {
    id: 'classic-blue',
    labelKey: 'editor.theme.classicBlue',
    defaults: {
      previewAccentColor: '#243447',
      previewFontFamily: 'sans',
      previewFontSize: 14,
      previewLineHeight: 1.65,
    },
    cssVars: {
      '--preview-accent': '#243447',
      '--preview-body': '#111827',
      '--preview-heading-bg': '#243447',
      '--preview-heading-text': '#ffffff',
      '--preview-line': '#243447',
      '--preview-muted': '#64748b',
      '--preview-paper-bg': '#ffffff',
      '--preview-paper-border': '#dbeafe',
      '--preview-section-gap': '18px',
      '--preview-title': '#0f172a',
      '--preview-watermark': 'rgba(15, 23, 42, 0.06)',
    },
  },
  {
    id: 'modern-sky',
    labelKey: 'editor.theme.modernSky',
    defaults: {
      previewAccentColor: '#2563eb',
      previewFontFamily: 'inter',
      previewFontSize: 14,
      previewLineHeight: 1.7,
    },
    cssVars: {
      '--preview-accent': '#2563eb',
      '--preview-body': '#0f172a',
      '--preview-heading-bg': '#dbeafe',
      '--preview-heading-text': '#1d4ed8',
      '--preview-line': '#93c5fd',
      '--preview-muted': '#475569',
      '--preview-paper-bg': '#f8fbff',
      '--preview-paper-border': '#bfdbfe',
      '--preview-section-gap': '20px',
      '--preview-title': '#0b1220',
      '--preview-watermark': 'rgba(37, 99, 235, 0.08)',
    },
  },
  {
    id: 'mono-compact',
    labelKey: 'editor.theme.monoCompact',
    defaults: {
      previewAccentColor: '#111827',
      previewFontFamily: 'serif',
      previewFontSize: 13,
      previewLineHeight: 1.5,
    },
    cssVars: {
      '--preview-accent': '#111827',
      '--preview-body': '#111111',
      '--preview-heading-bg': '#111111',
      '--preview-heading-text': '#ffffff',
      '--preview-line': '#111111',
      '--preview-muted': '#4b5563',
      '--preview-paper-bg': '#ffffff',
      '--preview-paper-border': '#d1d5db',
      '--preview-section-gap': '14px',
      '--preview-title': '#000000',
      '--preview-watermark': 'rgba(17, 17, 17, 0.045)',
    },
  },
] as const satisfies readonly ResumeThemeDefinition[]

export const resumeThemeMap = resumeThemes.reduce<
  Record<ResumeThemeId, ResumeThemeDefinition>
>(
  (themeMap, theme) => {
    themeMap[theme.id] = theme
    return themeMap
  },
  {} as Record<ResumeThemeId, ResumeThemeDefinition>,
)

export function isResumeThemeId(value: unknown): value is ResumeThemeId {
  return (
    typeof value === 'string' && resumeThemeIds.includes(value as ResumeThemeId)
  )
}

export function getResumeTheme(id: unknown) {
  return resumeThemeMap[isResumeThemeId(id) ? id : defaultResumeThemeId]
}
