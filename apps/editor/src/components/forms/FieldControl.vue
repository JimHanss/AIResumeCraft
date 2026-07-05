<script setup lang="ts">
defineProps<{
  label: string
  hint?: string
  inputId?: string
}>()
</script>

<template>
  <div class="field-control">
    <label v-if="inputId" class="field-control-title" :for="inputId">
      {{ label }}
    </label>
    <span v-else class="field-control-title">
      {{ label }}
    </span>

    <slot />

    <span v-if="hint" class="field-control-hint">
      {{ hint }}
    </span>
  </div>
</template>
