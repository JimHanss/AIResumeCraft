<script setup lang="ts">
import type { GlobalThemeOverrides } from 'naive-ui'
import { calculateOverallScore } from '@airesumecraft/shared'
import {
  darkTheme,
  dateEnUS,
  dateZhCN,
  enUS,
  NButton,
  NConfigProvider,
  NLayout,
  NLayoutContent,
  NLayoutHeader,
  NMessageProvider,
  NSelect,
  zhCN,
} from 'naive-ui'
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterView } from 'vue-router'
import HistoryControls from './components/HistoryControls.vue'
import { useResumeStore } from './stores/resume'

const store = useResumeStore()
const { locale, t } = useI18n()

const localeOptions = [
  { label: '中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' },
]

watch(
  () => store.document.locale,
  (value) => {
    if (locale.value !== value)
      locale.value = value
  },
  { immediate: true },
)

const selectedLocale = computed({
  get: () => locale.value,
  set: (value: string) => {
    locale.value = value
    store.setLocale(value as 'zh-CN' | 'en-US')
  },
})

const overallScore = computed(() => {
  const score = calculateOverallScore(store.document)
  return Number.isFinite(score) ? score : 0
})

const lightThemeOverrides: GlobalThemeOverrides = {
  common: {
    baseColor: '#ffffff',
    bodyColor: '#eff6ff',
    cardColor: '#ffffff',
    popoverColor: '#ffffff',
    modalColor: '#ffffff',
    primaryColor: '#3b82f6',
    primaryColorHover: '#60a5fa',
    primaryColorPressed: '#2563eb',
    primaryColorSuppl: '#93c5fd',
    infoColor: '#0ea5e9',
    infoColorHover: '#38bdf8',
    infoColorPressed: '#0284c7',
    infoColorSuppl: '#7dd3fc',
    borderColor: '#bfdbfe',
    dividerColor: '#dbeafe',
    hoverColor: '#eff6ff',
    pressedColor: '#dbeafe',
    textColor1: '#102033',
    textColor2: '#334155',
    textColor3: '#64748b',
    placeholderColor: '#7c8da5',
    borderRadius: '8px',
    borderRadiusSmall: '6px',
  },
}

const darkThemeOverrides: GlobalThemeOverrides = {
  common: {
    baseColor: '#0b1220',
    bodyColor: '#08111f',
    cardColor: '#0f1b2d',
    popoverColor: '#0f1b2d',
    modalColor: '#0f1b2d',
    primaryColor: '#60a5fa',
    primaryColorHover: '#93c5fd',
    primaryColorPressed: '#3b82f6',
    primaryColorSuppl: '#bfdbfe',
    infoColor: '#38bdf8',
    infoColorHover: '#7dd3fc',
    infoColorPressed: '#0ea5e9',
    infoColorSuppl: '#bae6fd',
    borderColor: '#1e3a5f',
    dividerColor: '#1d3557',
    hoverColor: '#10233b',
    pressedColor: '#17365d',
    textColor1: '#f8fbff',
    textColor2: '#dbeafe',
    textColor3: '#9fb9d9',
    placeholderColor: '#7d93b4',
    borderRadius: '8px',
    borderRadiusSmall: '6px',
  },
}

const activeThemeOverrides = computed(() =>
  store.preferences.darkMode ? darkThemeOverrides : lightThemeOverrides,
)

const activeNaiveLocale = computed(() =>
  locale.value === 'zh-CN' ? zhCN : enUS,
)
const activeNaiveDateLocale = computed(() =>
  locale.value === 'zh-CN' ? dateZhCN : dateEnUS,
)
</script>

<template>
  <NConfigProvider
    :date-locale="activeNaiveDateLocale"
    :locale="activeNaiveLocale"
    :theme="store.preferences.darkMode ? darkTheme : null"
    :theme-overrides="activeThemeOverrides"
  >
    <NMessageProvider>
      <NLayout
        class="app-shell"
        :class="{ 'is-dark': store.preferences.darkMode }"
      >
        <NLayoutHeader bordered class="app-header">
          <div class="brand-lockup">
            <div class="brand-mark">
              AR
            </div>
            <div>
              <strong>AIResumeCraft</strong>
              <span>{{ t('app.subtitle') }}</span>
            </div>
          </div>

          <div class="header-actions">
            <HistoryControls />
            <div
              class="header-score"
              data-testid="header-score"
              :aria-label="`${t('editor.metrics.score')} ${overallScore}`"
            >
              <span>{{ t('editor.metrics.score') }}</span>
              <strong>{{ overallScore }}</strong>
            </div>
            <NSelect
              v-model:value="selectedLocale"
              class="locale-select"
              :options="localeOptions"
            />
            <NButton secondary @click="store.toggleTheme">
              {{ store.preferences.darkMode ? t('app.light') : t('app.dark') }}
            </NButton>
          </div>
        </NLayoutHeader>

        <NLayoutContent>
          <RouterView />
        </NLayoutContent>
      </NLayout>
    </NMessageProvider>
  </NConfigProvider>
</template>
