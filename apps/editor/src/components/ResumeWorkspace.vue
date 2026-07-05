<script setup lang="ts">
import { calculateOverallScore } from '@airesumecraft/shared'
import { NSpace, NTag, NText } from 'naive-ui'
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useResumeStore } from '../stores/resume'
import MaterialPanel from './MaterialPanel.vue'
import ResumeCanvas from './ResumeCanvas.vue'
import ResumePreview from './ResumePreview.vue'

const store = useResumeStore()
const { t } = useI18n()
const overallScore = computed(() => calculateOverallScore(store.document))

onMounted(() => {
  void store.loadInitialResume()
})
</script>

<template>
  <main class="workspace">
    <section class="workspace-toolbar">
      <div>
        <NText depth="3" class="toolbar-eyebrow">
          {{ t('editor.toolbar.eyebrow') }}
        </NText>
        <h1>{{ t('editor.toolbar.title') }}</h1>
      </div>

      <NSpace align="center" class="toolbar-metrics">
        <div class="metric-pill">
          <span>{{ t('editor.metrics.modules') }}</span>
          <strong>{{ store.orderedModules.length }}</strong>
        </div>
        <div class="metric-pill accent">
          <span>{{ t('editor.metrics.score') }}</span>
          <strong>{{ overallScore }}</strong>
        </div>
        <NTag round type="info">
          {{ t('editor.localDraft') }}
        </NTag>
      </NSpace>
    </section>

    <div class="workspace-grid">
      <aside class="workspace-column workspace-column-left">
        <MaterialPanel />
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
