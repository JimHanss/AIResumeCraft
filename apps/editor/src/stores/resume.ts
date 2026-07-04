import type {
  ResumeDocument,
  ResumeLocale,
  ResumeSection,
} from '@airesumecraft/shared'
import {
  demoResume,
  reorderSections,
  sortSections,
} from '@airesumecraft/shared'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useResumeStore = defineStore(
  'resume',
  () => {
    const document = ref<ResumeDocument>(structuredClone(demoResume))
    const preferences = ref({
      darkMode: false,
    })

    const orderedSections = computed(() =>
      sortSections(document.value.sections),
    )

    function replaceSections(sections: ResumeSection[]) {
      document.value.sections = reorderSections(sections)
    }

    function updateSection(id: string, patch: Partial<ResumeSection>) {
      const index = document.value.sections.findIndex(
        (section) => section.id === id,
      )
      if (index === -1) return

      document.value.sections[index] = {
        ...document.value.sections[index],
        ...patch,
      }
    }

    function setLocale(locale: ResumeLocale) {
      document.value.locale = locale
    }

    function toggleTheme() {
      preferences.value.darkMode = !preferences.value.darkMode
    }

    return {
      document,
      orderedSections,
      preferences,
      replaceSections,
      setLocale,
      toggleTheme,
      updateSection,
    }
  },
  {
    persist: {
      key: 'airesumecraft:resume-editor',
      pick: ['document', 'preferences'],
    },
  },
)
