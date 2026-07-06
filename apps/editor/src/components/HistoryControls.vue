<script setup lang="ts">
import { NButton, NButtonGroup } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { useResumeStore } from '../stores/resume'

const store = useResumeStore()
const { t } = useI18n()
</script>

<template>
  <nav class="history-controls" :aria-label="t('editor.history.label')">
    <NButtonGroup size="small">
      <NButton
        class="history-icon-button"
        data-testid="undo-button"
        secondary
        type="primary"
        :aria-label="t('editor.history.undo')"
        :disabled="!store.canUndo"
        :title="
          store.canUndo
            ? t('editor.history.undo')
            : t('editor.history.cannotUndo')
        "
        @click="store.undo"
      >
        <svg
          class="button-icon"
          viewBox="0 0 24 24"
          focusable="false"
          aria-hidden="true"
        >
          <path d="M9 14 4 9l5-5" />
          <path d="M4 9h10a6 6 0 0 1 0 12h-2" />
        </svg>
      </NButton>
      <NButton
        class="history-icon-button"
        data-testid="redo-button"
        secondary
        type="primary"
        :aria-label="t('editor.history.redo')"
        :disabled="!store.canRedo"
        :title="
          store.canRedo
            ? t('editor.history.redo')
            : t('editor.history.cannotRedo')
        "
        @click="store.redo"
      >
        <svg
          class="button-icon"
          viewBox="0 0 24 24"
          focusable="false"
          aria-hidden="true"
        >
          <path d="m15 14 5-5-5-5" />
          <path d="M20 9H10a6 6 0 0 0 0 12h2" />
        </svg>
      </NButton>
    </NButtonGroup>
  </nav>
</template>
