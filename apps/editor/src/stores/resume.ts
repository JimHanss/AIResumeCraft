import type {
  AvatarResumeModule,
  CustomResumeField,
  CustomResumeModule,
  ResumeDocument,
  ResumeLocale,
  ResumeModule,
  ResumeModuleType,
} from '@airesumecraft/shared'
import type {
  ResumeThemeId,
  ResumeThemePreviewFontFamily,
} from '../config/resumeThemes'
import {
  cloneResumeModule,
  createCustomResumeModule,
  createResumeModule,
  demoResume,
  normalizeCustomFields,
  reorderModules as normalizeModuleOrder,
  reorderSections,
  safeResumeDocument,
  sortModules,
  sortSections,
} from '@airesumecraft/shared'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { getDemoResume } from '../api/resume'
import {
  defaultResumeThemeId,
  getResumeTheme,
  isResumeThemeId,
} from '../config/resumeThemes'

const persistenceKey = 'airesumecraft:resume-editor'

export interface ResumeModuleMaterial {
  type: ResumeModuleType
}

const materialDefinitions: ResumeModuleMaterial[] = [
  {
    type: 'avatar',
  },
  {
    type: 'summary',
  },
  {
    type: 'education',
  },
  {
    type: 'experience',
  },
  {
    type: 'skills',
  },
]

export type PdfExportQuality = 'standard' | 'high'

export interface EditorPreferences {
  darkMode: boolean
  exportQuality: PdfExportQuality
  previewAccentColor: string
  previewFontFamily: ResumeThemePreviewFontFamily
  previewFontSize: number
  previewLineHeight: number
  resumeThemeId: ResumeThemeId
}

interface ResumeHistorySnapshot {
  document: ResumeDocument
  preferences: EditorPreferences
  selectedModuleId?: string
}

const defaultTheme = getResumeTheme(defaultResumeThemeId)

export const defaultPreferences: EditorPreferences = {
  darkMode: false,
  exportQuality: 'standard',
  previewAccentColor: defaultTheme.defaults.previewAccentColor ?? '#243447',
  previewFontFamily: defaultTheme.defaults.previewFontFamily ?? 'sans',
  previewFontSize: defaultTheme.defaults.previewFontSize ?? 14,
  previewLineHeight: defaultTheme.defaults.previewLineHeight ?? 1.65,
  resumeThemeId: defaultTheme.id,
}

const historyLimit = 80
const pdfExportQualities: PdfExportQuality[] = ['standard', 'high']
const previewFontFamilies: ResumeThemePreviewFontFamily[] = [
  'sans',
  'inter',
  'serif',
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function normalizePreferences(input: unknown): EditorPreferences {
  if (!isRecord(input))
    return structuredClone(defaultPreferences)

  const theme = getResumeTheme(input.resumeThemeId)
  const defaults = theme.defaults

  return {
    darkMode:
      typeof input.darkMode === 'boolean'
        ? input.darkMode
        : defaultPreferences.darkMode,
    exportQuality:
      typeof input.exportQuality === 'string'
      && pdfExportQualities.includes(input.exportQuality as PdfExportQuality)
        ? (input.exportQuality as PdfExportQuality)
        : defaultPreferences.exportQuality,
    previewAccentColor:
      typeof input.previewAccentColor === 'string'
        ? input.previewAccentColor
        : (defaults.previewAccentColor
          ?? defaultPreferences.previewAccentColor),
    previewFontFamily:
      typeof input.previewFontFamily === 'string'
      && previewFontFamilies.includes(
        input.previewFontFamily as ResumeThemePreviewFontFamily,
      )
        ? (input.previewFontFamily as ResumeThemePreviewFontFamily)
        : (defaults.previewFontFamily ?? defaultPreferences.previewFontFamily),
    previewFontSize: normalizeNumber(
      input.previewFontSize,
      defaults.previewFontSize ?? defaultPreferences.previewFontSize,
    ),
    previewLineHeight: normalizeNumber(
      input.previewLineHeight,
      defaults.previewLineHeight ?? defaultPreferences.previewLineHeight,
    ),
    resumeThemeId: isResumeThemeId(input.resumeThemeId)
      ? input.resumeThemeId
      : defaultPreferences.resumeThemeId,
  }
}

function arePreferencesEqual(
  left: EditorPreferences,
  right: EditorPreferences,
) {
  return (
    left.darkMode === right.darkMode
    && left.exportQuality === right.exportQuality
    && left.previewAccentColor === right.previewAccentColor
    && left.previewFontFamily === right.previewFontFamily
    && left.previewFontSize === right.previewFontSize
    && left.previewLineHeight === right.previewLineHeight
    && left.resumeThemeId === right.resumeThemeId
  )
}

function hasPersistedResume() {
  return (
    typeof localStorage !== 'undefined'
    && localStorage.getItem(persistenceKey) != null
  )
}

function shouldLoadMockApi() {
  return import.meta.env.VITE_ENABLE_MSW === 'true'
}

function mergeCustomFields(
  currentFields: CustomResumeField[],
  nextFields: CustomResumeField[],
) {
  const currentById = new Map(currentFields.map(field => [field.id, field]))

  return normalizeCustomFields(
    nextFields.map((field) => {
      const current = currentById.get(field.id)
      if (!current || current.type !== field.type)
        return field

      if (field.type === 'list' && current.type === 'list') {
        return {
          ...field,
          items: field.items.length > 0 ? field.items : current.items,
        }
      }

      if (
        (field.type === 'text' || field.type === 'textarea')
        && (current.type === 'text' || current.type === 'textarea')
      ) {
        return {
          ...field,
          value: field.value || current.value,
        }
      }

      return field
    }),
  )
}

export const useResumeStore = defineStore(
  'resume',
  () => {
    const document = ref<ResumeDocument>(structuredClone(demoResume))
    const selectedModuleId = ref<string | undefined>(
      document.value.modules[0]?.id,
    )
    const dragPreviewModuleIds = ref<string[]>([])
    const preferences = ref<EditorPreferences>(
      structuredClone(defaultPreferences),
    )
    const pastSnapshots = ref<ResumeHistorySnapshot[]>([])
    const futureSnapshots = ref<ResumeHistorySnapshot[]>([])
    const isRestoringHistory = ref(false)

    const orderedSections = computed(() =>
      sortSections(document.value.sections),
    )
    const orderedModules = computed(() => sortModules(document.value.modules))
    const canUndo = computed(() => pastSnapshots.value.length > 0)
    const canRedo = computed(() => futureSnapshots.value.length > 0)
    const previewOrderedModules = computed(() => {
      if (dragPreviewModuleIds.value.length === 0)
        return orderedModules.value

      const modulesById = new Map(
        orderedModules.value.map(module => [module.id, module]),
      )
      const seenModuleIds = new Set<string>()
      const previewModules: ResumeModule[] = []

      for (const moduleId of dragPreviewModuleIds.value) {
        const module = modulesById.get(moduleId)
        if (!module || seenModuleIds.has(module.id))
          continue

        seenModuleIds.add(module.id)
        previewModules.push(module)
      }

      for (const module of orderedModules.value) {
        if (!seenModuleIds.has(module.id))
          previewModules.push(module)
      }

      return previewModules
    })
    const selectedModule = computed(() =>
      document.value.modules.find(
        module => module.id === selectedModuleId.value,
      ),
    )
    const availableMaterials = computed(() => materialDefinitions)
    const activeModuleTypes = computed(
      () => new Set(document.value.modules.map(module => module.type)),
    )

    watch(
      preferences,
      (value) => {
        const normalizedPreferences = normalizePreferences(value)
        if (!arePreferencesEqual(value, normalizedPreferences))
          preferences.value = normalizedPreferences
      },
      { deep: true, immediate: true },
    )

    function createHistorySnapshot(): ResumeHistorySnapshot {
      return {
        document: cloneJson(document.value),
        preferences: cloneJson(preferences.value),
        selectedModuleId: selectedModuleId.value,
      }
    }

    function recordHistory() {
      if (isRestoringHistory.value)
        return

      pastSnapshots.value = [
        ...pastSnapshots.value,
        createHistorySnapshot(),
      ].slice(-historyLimit)
      futureSnapshots.value = []
    }

    function restoreSnapshot(snapshot: ResumeHistorySnapshot) {
      isRestoringHistory.value = true
      clearDragPreviewModuleOrder()
      document.value = safeResumeDocument(snapshot.document, demoResume)
      document.value.modules = normalizeModuleOrder(document.value.modules)
      document.value.sections = reorderSections(document.value.sections)
      preferences.value = normalizePreferences(snapshot.preferences)
      selectedModuleId.value = document.value.modules.some(
        module => module.id === snapshot.selectedModuleId,
      )
        ? snapshot.selectedModuleId
        : document.value.modules[0]?.id
      isRestoringHistory.value = false
    }

    function undo() {
      const snapshot = pastSnapshots.value.at(-1)
      if (!snapshot)
        return false

      pastSnapshots.value = pastSnapshots.value.slice(0, -1)
      futureSnapshots.value = [
        createHistorySnapshot(),
        ...futureSnapshots.value,
      ].slice(0, historyLimit)
      restoreSnapshot(snapshot)
      return true
    }

    function redo() {
      const snapshot = futureSnapshots.value[0]
      if (!snapshot)
        return false

      futureSnapshots.value = futureSnapshots.value.slice(1)
      pastSnapshots.value = [
        ...pastSnapshots.value,
        createHistorySnapshot(),
      ].slice(-historyLimit)
      restoreSnapshot(snapshot)
      return true
    }

    function patchPreferences(patch: Partial<EditorPreferences>) {
      const nextPreferences = normalizePreferences({
        ...preferences.value,
        ...patch,
      })
      if (arePreferencesEqual(preferences.value, nextPreferences))
        return false

      recordHistory()
      preferences.value = nextPreferences
      return true
    }

    function restoreDocument(input: unknown) {
      clearDragPreviewModuleOrder()
      document.value = safeResumeDocument(input, demoResume)
      document.value.modules = normalizeModuleOrder(document.value.modules)
      document.value.sections = reorderSections(document.value.sections)
      if (
        !document.value.modules.some(
          module => module.id === selectedModuleId.value,
        )
      ) {
        selectedModuleId.value = document.value.modules[0]?.id
      }
    }

    async function loadInitialResume() {
      restoreDocument(document.value)

      if (hasPersistedResume())
        return

      if (!shouldLoadMockApi()) {
        restoreDocument(demoResume)
        return
      }

      try {
        restoreDocument(await getDemoResume())
      }
      catch {
        restoreDocument(demoResume)
      }
    }

    function replaceSections(sections: ResumeDocument['sections']) {
      recordHistory()
      document.value.sections = reorderSections(sections)
    }

    function updateSection(
      id: string,
      patch: Partial<ResumeDocument['sections'][number]>,
    ) {
      const index = document.value.sections.findIndex(
        section => section.id === id,
      )
      if (index === -1)
        return

      recordHistory()
      document.value.sections[index] = {
        ...document.value.sections[index],
        ...patch,
      }
    }

    function createModule(type: ResumeModuleType) {
      return createResumeModule(type)
    }

    function addModule(type: ResumeModuleType, afterId?: string) {
      recordHistory()
      const module = createModule(type)
      const modules = [...orderedModules.value]
      const index = afterId
        ? modules.findIndex(item => item.id === afterId)
        : -1

      if (index >= 0)
        modules.splice(index + 1, 0, module)
      else modules.push(module)

      reorderModules(modules, { record: false })
      selectedModuleId.value = module.id
      return module
    }

    function addFirstInactiveModule() {
      const inactiveMaterial = materialDefinitions.find(
        material => !activeModuleTypes.value.has(material.type),
      )
      return addModule(inactiveMaterial?.type ?? 'summary')
    }

    function addCustomModule(
      input: Partial<CustomResumeModule>,
      afterId?: string,
    ) {
      const title = input.title?.trim()
      if (!title)
        return

      recordHistory()
      const module = createCustomResumeModule({
        ...input,
        title,
        content: {
          fields: normalizeCustomFields(input.content?.fields ?? []),
        },
      })
      const modules = [...orderedModules.value]
      const index = afterId
        ? modules.findIndex(item => item.id === afterId)
        : -1

      if (index >= 0)
        modules.splice(index + 1, 0, module)
      else modules.push(module)

      reorderModules(modules, { record: false })
      selectedModuleId.value = module.id
      return module
    }

    function reorderModules(
      modules: ResumeModule[],
      options: { record?: boolean } = {},
    ) {
      if (options.record !== false)
        recordHistory()

      clearDragPreviewModuleOrder()
      document.value.modules = normalizeModuleOrder(modules)
    }

    function setDragPreviewModuleOrder(moduleIds: string[]) {
      const knownModuleIds = new Set(
        orderedModules.value.map(module => module.id),
      )
      const nextModuleIds: string[] = []

      for (const moduleId of moduleIds) {
        if (knownModuleIds.has(moduleId) && !nextModuleIds.includes(moduleId))
          nextModuleIds.push(moduleId)
      }

      dragPreviewModuleIds.value
        = nextModuleIds.length === orderedModules.value.length
          ? nextModuleIds
          : []
    }

    function clearDragPreviewModuleOrder() {
      dragPreviewModuleIds.value = []
    }

    function renameModule(id: string, title: string) {
      const nextTitle = title.trim()
      if (!nextTitle)
        return false

      const index = document.value.modules.findIndex(
        module => module.id === id,
      )
      if (index === -1)
        return false

      recordHistory()
      document.value.modules[index] = {
        ...document.value.modules[index],
        title: nextTitle,
      } as ResumeModule
      return true
    }

    function replaceCustomModuleSchema(
      id: string,
      input: Partial<Pick<CustomResumeModule, 'content' | 'title'>>,
    ) {
      const index = document.value.modules.findIndex(
        module => module.id === id && module.type === 'custom',
      )
      if (index === -1)
        return false

      const module = document.value.modules[index]
      if (module?.type !== 'custom')
        return false

      const nextTitle = input.title?.trim() || module.title
      const fields = mergeCustomFields(
        module.content.fields,
        input.content?.fields ?? module.content.fields,
      )

      recordHistory()
      document.value.modules[index] = {
        ...module,
        title: nextTitle,
        content: {
          fields,
        },
      }
      return true
    }

    function updateModule(id: string, patch: Partial<ResumeModule['content']>) {
      const index = document.value.modules.findIndex(
        module => module.id === id,
      )
      if (index === -1)
        return

      recordHistory()
      const module = document.value.modules[index]
      const nextModule = {
        ...module,
        content: {
          ...module.content,
          ...patch,
        },
      } as ResumeModule

      document.value.modules[index] = nextModule

      if (nextModule.type === 'avatar')
        syncProfileFromAvatar(nextModule)
    }

    function removeModule(id: string) {
      if (!document.value.modules.some(module => module.id === id))
        return

      recordHistory()
      clearDragPreviewModuleOrder()
      const nextModules = document.value.modules.filter(
        module => module.id !== id,
      )
      document.value.modules = normalizeModuleOrder(nextModules)

      if (selectedModuleId.value === id)
        selectedModuleId.value = document.value.modules[0]?.id
    }

    function removeModulesByType(type: ResumeModuleType) {
      if (!document.value.modules.some(module => module.type === type))
        return

      recordHistory()
      clearDragPreviewModuleOrder()
      const removedSelectedModule = document.value.modules.some(
        module =>
          module.type === type && module.id === selectedModuleId.value,
      )
      document.value.modules = normalizeModuleOrder(
        document.value.modules.filter(module => module.type !== type),
      )

      if (removedSelectedModule)
        selectedModuleId.value = document.value.modules[0]?.id
    }

    function toggleModuleType(type: ResumeModuleType, enabled: boolean) {
      if (enabled) {
        if (!activeModuleTypes.value.has(type))
          addModule(type)
        return
      }

      removeModulesByType(type)
    }

    function duplicateModule(id: string) {
      const module = document.value.modules.find(item => item.id === id)
      if (!module)
        return

      const clone = cloneResumeModule(module)
      const modules = [...orderedModules.value]
      const index = modules.findIndex(item => item.id === id)
      modules.splice(index + 1, 0, clone)
      recordHistory()
      reorderModules(modules, { record: false })
      selectedModuleId.value = clone.id
      return clone
    }

    function resetResume() {
      recordHistory()
      restoreDocument(demoResume)
    }

    function selectModule(id: string) {
      selectedModuleId.value = id
    }

    function setLocale(locale: ResumeLocale) {
      recordHistory()
      document.value.locale = locale
    }

    function toggleTheme() {
      patchPreferences({
        darkMode: !preferences.value.darkMode,
      })
    }

    function setResumeTheme(themeId: ResumeThemeId) {
      const theme = getResumeTheme(themeId)
      return patchPreferences({
        previewAccentColor:
          theme.defaults.previewAccentColor
          ?? preferences.value.previewAccentColor,
        previewFontFamily:
          theme.defaults.previewFontFamily
          ?? preferences.value.previewFontFamily,
        previewFontSize:
          theme.defaults.previewFontSize ?? preferences.value.previewFontSize,
        previewLineHeight:
          theme.defaults.previewLineHeight
          ?? preferences.value.previewLineHeight,
        resumeThemeId: theme.id,
      })
    }

    function setPreviewFontFamily(value: ResumeThemePreviewFontFamily) {
      return patchPreferences({
        previewFontFamily: value,
      })
    }

    function setPreviewFontSize(value: number) {
      return patchPreferences({
        previewFontSize: value,
      })
    }

    function setPreviewLineHeight(value: number) {
      return patchPreferences({
        previewLineHeight: value,
      })
    }

    function setPreviewAccentColor(value: string) {
      return patchPreferences({
        previewAccentColor: value,
      })
    }

    function setExportQuality(value: PdfExportQuality) {
      return patchPreferences({
        exportQuality: value,
      })
    }

    function syncProfileFromAvatar(module: AvatarResumeModule) {
      document.value.profile = {
        name: module.content.name || document.value.profile.name,
        headline: module.content.headline || document.value.profile.headline,
        email: module.content.email || document.value.profile.email,
        location: module.content.location || document.value.profile.location,
      }
    }

    return {
      activeModuleTypes,
      addFirstInactiveModule,
      addCustomModule,
      addModule,
      availableMaterials,
      canRedo,
      canUndo,
      clearDragPreviewModuleOrder,
      createModule,
      document,
      duplicateModule,
      loadInitialResume,
      orderedModules,
      orderedSections,
      previewOrderedModules,
      preferences,
      redo,
      removeModule,
      replaceSections,
      removeModulesByType,
      renameModule,
      replaceCustomModuleSchema,
      resetResume,
      restoreDocument,
      reorderModules,
      setExportQuality,
      setDragPreviewModuleOrder,
      setPreviewAccentColor,
      setPreviewFontFamily,
      setPreviewFontSize,
      setPreviewLineHeight,
      setResumeTheme,
      selectModule,
      selectedModule,
      selectedModuleId,
      setLocale,
      toggleTheme,
      toggleModuleType,
      undo,
      updateModule,
      updateSection,
    }
  },
  {
    persist: {
      key: persistenceKey,
      pick: ['document', 'preferences', 'selectedModuleId'],
    },
  },
)
