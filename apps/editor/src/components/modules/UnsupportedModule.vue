<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{
  type: string
}>()

const { t } = useI18n()
</script>

<template>
  <div class="unsupported-module">
    {{ t('editor.unsupportedModule', { type }) }}
  </div>
</template>
