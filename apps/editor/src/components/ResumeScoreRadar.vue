<script setup lang="ts">
import type { ResumeScore } from '@airesumecraft/shared'
import { RadarChart } from 'echarts/charts'
import { LegendComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  score: ResumeScore
}>()

echarts.use([RadarChart, TooltipComponent, LegendComponent, CanvasRenderer])

const chartEl = ref<HTMLDivElement>()
let chart: echarts.ECharts | undefined
let observer: ResizeObserver | undefined

function renderChart() {
  if (!chartEl.value)
    return

  chart ??= echarts.init(chartEl.value)
  chart.setOption({
    tooltip: {},
    radar: {
      indicator: [
        { name: 'Impact', max: 100 },
        { name: 'Clarity', max: 100 },
        { name: 'Relevance', max: 100 },
        { name: 'ATS', max: 100 },
      ],
      radius: 74,
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: [
              props.score.impact,
              props.score.clarity,
              props.score.relevance,
              props.score.ats,
            ],
            name: 'Resume score',
            areaStyle: {
              opacity: 0.18,
            },
          },
        ],
      },
    ],
  })
}

watch(() => props.score, renderChart, { deep: true })

onMounted(() => {
  renderChart()
  observer = new ResizeObserver(() => chart?.resize())
  if (chartEl.value)
    observer.observe(chartEl.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  chart?.dispose()
})
</script>

<template>
  <div ref="chartEl" class="score-radar" />
</template>
