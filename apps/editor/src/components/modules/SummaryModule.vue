<script setup lang="ts">
import type { SummaryResumeModule } from '@airesumecraft/shared'
import { NInput } from 'naive-ui'

const props = defineProps<{
  module: SummaryResumeModule
}>()

const emit = defineEmits<{
  update: [patch: Partial<SummaryResumeModule['content']>]
}>()
</script>

<template>
  <NInput
    class="summary-textarea"
    type="textarea"
    :value="props.module.content.text"
    placeholder="Write a concise professional summary"
    :autosize="{ minRows: 4, maxRows: 8 }"
    @update:value="(value) => emit('update', { text: value })"
  />
</template>
