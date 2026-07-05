<script setup lang="ts">
import { calculateOverallScore } from '@airesumecraft/shared'
import { NButton, NCard, NSpace, NTag, NText } from 'naive-ui'
import { computed, onMounted } from 'vue'
import { useResumeStore } from '../stores/resume'
import MaterialPanel from './MaterialPanel.vue'
import ResumeCanvas from './ResumeCanvas.vue'
import ResumeScoreRadar from './ResumeScoreRadar.vue'

const store = useResumeStore()
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
          Resume builder
        </NText>
        <h1>Editor workspace</h1>
      </div>

      <NSpace align="center" class="toolbar-metrics">
        <div class="metric-pill">
          <span>Modules</span>
          <strong>{{ store.orderedModules.length }}</strong>
        </div>
        <div class="metric-pill accent">
          <span>Score</span>
          <strong>{{ overallScore }}</strong>
        </div>
        <NTag round type="success">
          Local draft
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
        <NCard title="Score" size="small" class="side-panel">
          <div class="score-overview">
            <span>Overall</span>
            <strong>{{ overallScore }}</strong>
          </div>
          <ResumeScoreRadar :score="store.document.score" />
        </NCard>

        <NCard title="Workspace" size="small" class="side-panel panel-gap">
          <div class="state-summary">
            <div class="state-row">
              <span>Selected</span>
              <strong>{{ store.selectedModule?.title ?? 'None' }}</strong>
            </div>
            <div class="state-row">
              <span>Persistence</span>
              <strong>localStorage</strong>
            </div>
            <div class="state-row">
              <span>Locale</span>
              <strong>{{ store.document.locale }}</strong>
            </div>
          </div>

          <NButton
            class="panel-gap full-width-action"
            secondary
            type="warning"
            @click="store.resetResume"
          >
            Reset demo resume
          </NButton>
        </NCard>
      </aside>
    </div>
  </main>
</template>
