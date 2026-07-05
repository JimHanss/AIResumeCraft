<script setup lang="ts">
import {
  darkTheme,
  NButton,
  NConfigProvider,
  NLayout,
  NLayoutContent,
  NLayoutHeader,
  NMessageProvider,
  NSelect,
  NSpace,
} from 'naive-ui'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterView } from 'vue-router'
import { useResumeStore } from './stores/resume'

const store = useResumeStore()
const { locale, t } = useI18n()

const localeOptions = [
  { label: '中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' },
]

const selectedLocale = computed({
  get: () => locale.value,
  set: (value: string) => {
    locale.value = value
    store.setLocale(value as 'zh-CN' | 'en-US')
  },
})
</script>

<template>
  <NConfigProvider :theme="store.preferences.darkMode ? darkTheme : null">
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

          <NSpace align="center" :wrap="false">
            <NSelect
              v-model:value="selectedLocale"
              class="locale-select"
              :options="localeOptions"
            />
            <NButton secondary @click="store.toggleTheme">
              {{ store.preferences.darkMode ? t('app.light') : t('app.dark') }}
            </NButton>
          </NSpace>
        </NLayoutHeader>

        <NLayoutContent>
          <RouterView />
        </NLayoutContent>
      </NLayout>
    </NMessageProvider>
  </NConfigProvider>
</template>
