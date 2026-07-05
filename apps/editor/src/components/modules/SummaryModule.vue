<script setup lang="ts">
import type { SummaryResumeModule } from '@airesumecraft/shared'
import { NInput } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import FieldControl from '../forms/FieldControl.vue'

const props = defineProps<{
  module: SummaryResumeModule
}>()

const emit = defineEmits<{
  update: [patch: Partial<SummaryResumeModule['content']>]
}>()

const { t } = useI18n()
</script>

<template>
  <FieldControl :label="t('editor.fields.summary')">
    <NInput
      class="summary-textarea"
      type="textarea"
      :value="props.module.content.text"
      :placeholder="t('editor.fields.summary')"
      :autosize="{ minRows: 4, maxRows: 8 }"
      @update:value="(value) => emit('update', { text: value })"
    />
  </FieldControl>
</template>
