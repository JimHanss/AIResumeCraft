<script setup lang="ts">
import type { ResumeSection } from '@airesumecraft/shared'
import { calculateOverallScore, reorderSections } from '@airesumecraft/shared'
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import {
  NButton,
  NCard,
  NGrid,
  NGridItem,
  NInput,
  NList,
  NListItem,
  NScrollbar,
  NSpace,
  NTag,
  NText,
} from 'naive-ui'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Draggable from 'vuedraggable'
import { useAIStream } from '../composables/useAIStream'
import { useResumeStore } from '../stores/resume'
import ResumeScoreRadar from './ResumeScoreRadar.vue'

const store = useResumeStore()
const { t } = useI18n()
const { content, isStreaming, stream, abort } = useAIStream()
const activeSectionId = ref(store.document.sections[0]?.id)

const sections = computed({
  get: () => store.orderedSections,
  set: (value: ResumeSection[]) => {
    store.replaceSections(reorderSections(value))
  },
})

const activeSection = computed(() => {
  return store.document.sections.find(
    (section) => section.id === activeSectionId.value,
  )
})

const previewHtml = computed(() => {
  const markdown = activeSection.value?.markdown ?? ''
  return DOMPurify.sanitize(marked.parse(markdown, { async: false }) as string)
})

const overallScore = computed(() => calculateOverallScore(store.document))

function updateActiveMarkdown(value: string) {
  if (!activeSection.value) return

  store.updateSection(activeSection.value.id, { markdown: value })
}

function improveWithAI() {
  stream({
    provider: 'mock',
    targetRole: store.document.profile.headline,
    language: store.document.locale,
    sourceMarkdown: activeSection.value?.markdown,
  })
}
</script>

<template>
  <main class="workspace">
    <NGrid :cols="24" :x-gap="16" :y-gap="16" responsive="screen">
      <NGridItem :span="6" :m="24">
        <NCard :title="t('editor.sections')" size="small">
          <Draggable
            v-model="sections"
            item-key="id"
            handle=".drag-handle"
            ghost-class="drag-ghost"
          >
            <template #item="{ element }">
              <button
                class="section-row"
                :class="{ active: element.id === activeSectionId }"
                type="button"
                @click="activeSectionId = element.id"
              >
                <span class="drag-handle">::</span>
                <span>{{ element.title }}</span>
              </button>
            </template>
          </Draggable>
        </NCard>

        <NCard :title="t('editor.score')" size="small" class="panel-gap">
          <ResumeScoreRadar :score="store.document.score" />
          <NText depth="2">
            {{ t('editor.overall') }}: {{ overallScore }}
          </NText>
        </NCard>
      </NGridItem>

      <NGridItem :span="10" :m="24">
        <NCard :title="activeSection?.title ?? t('editor.editor')" size="small">
          <NInput
            type="textarea"
            :value="activeSection?.markdown"
            :autosize="{ minRows: 18, maxRows: 28 }"
            @update:value="updateActiveMarkdown"
          />

          <NSpace class="panel-gap">
            <NButton
              type="primary"
              :loading="isStreaming"
              @click="improveWithAI"
            >
              {{ t('editor.aiImprove') }}
            </NButton>
            <NButton v-if="isStreaming" secondary @click="abort">
              {{ t('editor.abort') }}
            </NButton>
          </NSpace>

          <NCard v-if="content" size="small" class="panel-gap" embedded>
            <NText>{{ content }}</NText>
          </NCard>
        </NCard>
      </NGridItem>

      <NGridItem :span="8" :m="24">
        <NCard size="small">
          <template #header>
            <NSpace align="center" justify="space-between">
              <span>{{ store.document.profile.name }}</span>
              <NTag type="success">
                {{ store.document.locale }}
              </NTag>
            </NSpace>
          </template>

          <NScrollbar class="preview-scroll">
            <section class="resume-preview">
              <h1>{{ store.document.profile.name }}</h1>
              <p>{{ store.document.profile.headline }}</p>
              <NList>
                <NListItem
                  v-for="section in store.orderedSections"
                  :key="section.id"
                >
                  <h2>{{ section.title }}</h2>
                  <article
                    v-html="
                      section.id === activeSectionId
                        ? previewHtml
                        : DOMPurify.sanitize(
                            marked.parse(section.markdown, {
                              async: false,
                            }) as string,
                          )
                    "
                  />
                </NListItem>
              </NList>
            </section>
          </NScrollbar>
        </NCard>
      </NGridItem>
    </NGrid>
  </main>
</template>
