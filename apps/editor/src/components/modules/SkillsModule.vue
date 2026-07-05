<script setup lang="ts">
import type { SkillsResumeModule } from '@airesumecraft/shared'
import { NDynamicTags } from 'naive-ui'

const props = defineProps<{
  module: SkillsResumeModule
}>()

const emit = defineEmits<{
  update: [patch: Partial<SkillsResumeModule['content']>]
}>()

function updateSkills(skills: string[]) {
  emit('update', { skills })
}
</script>

<template>
  <NDynamicTags
    :value="props.module.content.skills"
    @update:value="updateSkills"
  />
</template>
