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

function hasPersistedResume() {
  return (
    typeof localStorage !== 'undefined'
    && localStorage.getItem(persistenceKey) != null
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
    const dragPreviewModuleIds = ref<string[]>([])
    const preferences = ref({
      darkMode: false,
    })

    const orderedSections = computed(() =>
      sortSections(document.value.sections),
    )
    const orderedModules = computed(() => sortModules(document.value.modules))
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
        ? modules.findIndex(item => item.id === afterId)
        : -1

      if (index >= 0)
        modules.splice(index + 1, 0, module)
      else modules.push(module)

      reorderModules(modules)
      selectedModuleId.value = module.id
      return module
    }

    function addFirstInactiveModule() {
      const inactiveMaterial = materialDefinitions.find(
        material => !activeModuleTypes.value.has(material.type),
      )
      return addModule(inactiveMaterial?.type ?? 'summary')
    }

    function reorderModules(modules: ResumeModule[]) {
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

      document.value.modules[index] = {
        ...document.value.modules[index],
        title: nextTitle,
      } as ResumeModule
      return true
    }

    function updateModule(id: string, patch: Partial<ResumeModule['content']>) {
      const index = document.value.modules.findIndex(
        module => module.id === id,
      )
      if (index === -1)
        return

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
      clearDragPreviewModuleOrder()
      const nextModules = document.value.modules.filter(
        module => module.id !== id,
      )
      document.value.modules = normalizeModuleOrder(nextModules)

      if (selectedModuleId.value === id)
        selectedModuleId.value = document.value.modules[0]?.id
    }

    function removeModulesByType(type: ResumeModuleType) {
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
      activeModuleTypes,
      addFirstInactiveModule,
      addModule,
      availableMaterials,
      createModule,
      document,
      duplicateModule,
      loadInitialResume,
      orderedModules,
      orderedSections,
      previewOrderedModules,
      preferences,
      removeModule,
      replaceSections,
      removeModulesByType,
      renameModule,
      resetResume,
      restoreDocument,
      reorderModules,
      setDragPreviewModuleOrder,
      selectModule,
      selectedModule,
      selectedModuleId,
      setLocale,
      toggleTheme,
      toggleModuleType,
      updateModule,
      updateSection,
      clearDragPreviewModuleOrder,
    }
  },
  {
    persist: {
      key: persistenceKey,
      pick: ['document', 'preferences', 'selectedModuleId'],
    },
  },
)
