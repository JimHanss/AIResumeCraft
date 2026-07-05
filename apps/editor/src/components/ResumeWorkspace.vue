<script setup lang="ts">
import { calculateOverallScore } from '@airesumecraft/shared'
import { NButton, NCard, NGrid, NGridItem, NStatistic, NText } from 'naive-ui'
import { computed, onMounted } from 'vue'
import { useResumeStore } from '../stores/resume'
import MaterialPanel from './MaterialPanel.vue'
import ResumeCanvas from './ResumeCanvas.vue'

const store = useResumeStore()
const overallScore = computed(() => calculateOverallScore(store.document))

onMounted(() => {
  void store.loadInitialResume()
})
</script>

<template>
  <main class="workspace">
    <NGrid :cols="24" :x-gap="16" :y-gap="16" responsive="screen">
      <NGridItem :span="5" :m="24">
        <MaterialPanel />
      </NGridItem>

      <NGridItem :span="13" :m="24">
        <ResumeCanvas />
      </NGridItem>

      <NGridItem :span="6" :m="24">
        <NCard title="Resume State" size="small">
          <NStatistic label="Modules" :value="store.orderedModules.length" />
          <NStatistic
            class="panel-gap"
            label="Overall score"
            :value="overallScore"
          />

          <div class="state-summary">
            <NText depth="2">
              Selected:
              {{ store.selectedModule?.title ?? 'None' }}
            </NText>
            <NText depth="2"> Persistence: localStorage </NText>
          </div>

          <NButton
            class="panel-gap"
            secondary
            type="warning"
            @click="store.resetResume"
          >
            Reset demo resume
          </NButton>
        </NCard>
      </NGridItem>
    </NGrid>
  </main>
</template>
