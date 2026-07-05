import type {
  AvatarResumeModule,
  ResumeDocument,
  ResumeLocale,
  ResumeModule,
  ResumeModuleType,
} from '@airesumecraft/shared'
import {
  cloneResumeModule,
  createResumeModule,
  demoResume,
  reorderModules as normalizeModuleOrder,
  reorderSections,
  safeResumeDocument,
  sortModules,
  sortSections,
} from '@airesumecraft/shared'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getDemoResume } from '../api/resume'

const persistenceKey = 'airesumecraft:resume-editor'

export interface ResumeModuleMaterial {
  type: ResumeModuleType
  title: string
  description: string
}

const materialDefinitions: ResumeModuleMaterial[] = [
  {
    type: 'avatar',
    title: 'Basic Info',
    description: 'Name, headline, contact, and avatar.',
  },
  {
    type: 'summary',
    title: 'Summary',
    description: 'A concise professional introduction.',
  },
  {
    type: 'experience',
    title: 'Experience',
    description: 'Company, role, dates, and impact bullets.',
  },
  {
    type: 'skills',
    title: 'Skills',
    description: 'Keyword-friendly skill list.',
  },
]

function hasPersistedResume() {
  return (
    typeof localStorage !== 'undefined' &&
    localStorage.getItem(persistenceKey) != null
  )
}

function shouldLoadMockApi() {
  return import.meta.env.VITE_ENABLE_MSW === 'true'
}

export const useResumeStore = defineStore(
  'resume',
  () => {
    const document = ref<ResumeDocument>(structuredClone(demoResume))
    const selectedModuleId = ref<string | undefined>(
      document.value.modules[0]?.id,
    )
    const preferences = ref({
      darkMode: false,
    })

    const orderedSections = computed(() =>
      sortSections(document.value.sections),
    )
    const orderedModules = computed(() => sortModules(document.value.modules))
    const selectedModule = computed(() =>
      document.value.modules.find(
        (module) => module.id === selectedModuleId.value,
      ),
    )
    const availableMaterials = computed(() => materialDefinitions)

    function restoreDocument(input: unknown) {
      document.value = safeResumeDocument(input, demoResume)
      document.value.modules = normalizeModuleOrder(document.value.modules)
      document.value.sections = reorderSections(document.value.sections)
      if (
        !document.value.modules.some(
          (module) => module.id === selectedModuleId.value,
        )
      )
        selectedModuleId.value = document.value.modules[0]?.id
    }

    async function loadInitialResume() {
      restoreDocument(document.value)

      if (hasPersistedResume()) return

      if (!shouldLoadMockApi()) {
        restoreDocument(demoResume)
        return
      }

      try {
        restoreDocument(await getDemoResume())
      } catch {
        restoreDocument(demoResume)
      }
    }

    function replaceSections(sections: ResumeDocument['sections']) {
      document.value.sections = reorderSections(sections)
    }

    function updateSection(
      id: string,
      patch: Partial<ResumeDocument['sections'][number]>,
    ) {
      const index = document.value.sections.findIndex(
        (section) => section.id === id,
      )
      if (index === -1) return

      document.value.sections[index] = {
        ...document.value.sections[index],
        ...patch,
      }
    }

    function createModule(type: ResumeModuleType) {
      return createResumeModule(type)
    }

    function addModule(type: ResumeModuleType, afterId?: string) {
      const module = createModule(type)
      const modules = [...orderedModules.value]
      const index = afterId
        ? modules.findIndex((item) => item.id === afterId)
        : -1

      if (index >= 0) modules.splice(index + 1, 0, module)
      else modules.push(module)

      reorderModules(modules)
      selectedModuleId.value = module.id
      return module
    }

    function reorderModules(modules: ResumeModule[]) {
      document.value.modules = normalizeModuleOrder(modules)
    }

    function updateModule(id: string, patch: Partial<ResumeModule['content']>) {
      const index = document.value.modules.findIndex(
        (module) => module.id === id,
      )
      if (index === -1) return

      const module = document.value.modules[index]
      const nextModule = {
        ...module,
        content: {
          ...module.content,
          ...patch,
        },
      } as ResumeModule

      document.value.modules[index] = nextModule

      if (nextModule.type === 'avatar') syncProfileFromAvatar(nextModule)
    }

    function removeModule(id: string) {
      const nextModules = document.value.modules.filter(
        (module) => module.id !== id,
      )
      document.value.modules = normalizeModuleOrder(nextModules)

      if (selectedModuleId.value === id)
        selectedModuleId.value = document.value.modules[0]?.id
    }

    function duplicateModule(id: string) {
      const module = document.value.modules.find((item) => item.id === id)
      if (!module) return

      const clone = cloneResumeModule(module)
      const modules = [...orderedModules.value]
      const index = modules.findIndex((item) => item.id === id)
      modules.splice(index + 1, 0, clone)
      reorderModules(modules)
      selectedModuleId.value = clone.id
      return clone
    }

    function resetResume() {
      restoreDocument(demoResume)
    }

    function selectModule(id: string) {
      selectedModuleId.value = id
    }

    function setLocale(locale: ResumeLocale) {
      document.value.locale = locale
    }

    function toggleTheme() {
      preferences.value.darkMode = !preferences.value.darkMode
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
      addModule,
      availableMaterials,
      createModule,
      document,
      duplicateModule,
      loadInitialResume,
      orderedModules,
      orderedSections,
      preferences,
      removeModule,
      replaceSections,
      resetResume,
      restoreDocument,
      reorderModules,
      selectModule,
      selectedModule,
      selectedModuleId,
      setLocale,
      toggleTheme,
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
