<script setup lang="ts">
import { calculateOverallScore } from '@airesumecraft/shared'
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useResumeStore } from '../stores/resume'
import MaterialPanel from './MaterialPanel.vue'
import ResumeCanvas from './ResumeCanvas.vue'
import ResumePreview from './ResumePreview.vue'
import ResumeScoreRadar from './ResumeScoreRadar.vue'

const store = useResumeStore()
const { t } = useI18n()
const sidebarScore = computed(() => {
  const score = calculateOverallScore(store.document)
  return Number.isFinite(score) ? score : 0
})

onMounted(() => {
  void store.loadInitialResume()
})
</script>

<template>
  <main class="workspace">
    <div class="workspace-grid">
      <aside class="workspace-column workspace-column-left">
        <MaterialPanel />
        <section
          class="sidebar-score-card"
          data-testid="left-score-panel"
          :aria-label="t('editor.scoreRadar.title')"
        >
          <div class="score-overview">
            <span>{{ t('editor.scoreRadar.title') }}</span>
            <strong>{{ sidebarScore }}</strong>
          </div>
          <ResumeScoreRadar :score="store.document.score" />
        </section>
      </aside>

      <section class="workspace-column workspace-column-main">
        <ResumeCanvas />
      </section>

      <aside class="workspace-column workspace-column-right">
        <ResumePreview />
      </aside>
    </div>
  </main>
</template>
