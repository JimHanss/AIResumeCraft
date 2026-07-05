<script setup lang="ts">
import type { ResumeScore } from '@airesumecraft/shared'
import { RadarChart } from 'echarts/charts'
import { LegendComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useResumeStore } from '../stores/resume'

const props = defineProps<{
  score: ResumeScore
}>()

echarts.use([RadarChart, TooltipComponent, LegendComponent, CanvasRenderer])

const store = useResumeStore()
const { locale, t } = useI18n()
const chartEl = ref<HTMLDivElement>()
let chart: echarts.ECharts | undefined
let observer: ResizeObserver | undefined

function renderChart() {
  if (!chartEl.value)
    return

  const styles = getComputedStyle(chartEl.value)
  const primary = styles.getPropertyValue('--primary').trim()
  const primarySoft = styles.getPropertyValue('--primary-soft').trim()
  const border = styles.getPropertyValue('--border').trim()
  const muted = styles.getPropertyValue('--muted').trim()
  const text = styles.getPropertyValue('--text').trim()

  chart ??= echarts.init(chartEl.value)
  chart.setOption({
    color: [primary],
    tooltip: {},
    radar: {
      indicator: [
        { name: t('editor.scoreDimensions.impact'), max: 100 },
        { name: t('editor.scoreDimensions.clarity'), max: 100 },
        { name: t('editor.scoreDimensions.relevance'), max: 100 },
        { name: t('editor.scoreDimensions.ats'), max: 100 },
      ],
      radius: 74,
      axisName: {
        color: muted,
      },
      axisLine: {
        lineStyle: {
          color: border,
        },
      },
      splitLine: {
        lineStyle: {
          color: border,
        },
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(255, 255, 255, 0)', primarySoft],
        },
      },
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
            name: t('editor.scoreSeries'),
            areaStyle: {
              color: primarySoft,
              opacity: 0.72,
            },
            lineStyle: {
              color: primary,
              width: 2,
            },
            itemStyle: {
              color: primary,
            },
          },
        ],
      },
    ],
    textStyle: {
      color: text,
    },
  })
}

watch(() => props.score, renderChart, { deep: true })
watch(
  () => store.preferences.darkMode,
  () => void nextTick(renderChart),
)
watch(
  () => locale.value,
  () => void nextTick(renderChart),
)

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
