<script setup lang="ts">
import type { ResumeModule } from '@airesumecraft/shared'
import { NButton, NSpace, NTag } from 'naive-ui'

defineProps<{
  module: ResumeModule
  selected: boolean
}>()

const emit = defineEmits<{
  duplicate: []
  remove: []
  select: []
}>()
</script>

<template>
  <section
    class="module-frame"
    :class="{ selected }"
    data-testid="resume-module"
    :data-module-id="module.id"
    :data-module-type="module.type"
    @click="emit('select')"
  >
    <header class="module-frame-header">
      <NSpace align="center" :wrap="false">
        <span class="drag-handle" :data-testid="`module-drag-${module.id}`"
          >::</span
        >
        <strong>{{ module.title }}</strong>
        <NTag size="small" round>
          {{ module.type }}
        </NTag>
      </NSpace>

      <NSpace :wrap="false" size="small">
        <NButton size="tiny" secondary @click.stop="emit('duplicate')">
          Duplicate
        </NButton>
        <NButton
          size="tiny"
          secondary
          type="error"
          @click.stop="emit('remove')"
        >
          Remove
        </NButton>
      </NSpace>
    </header>

    <div class="module-frame-body">
      <slot />
    </div>
  </section>
</template>
