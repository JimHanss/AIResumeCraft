<script setup lang="ts">
import type { AvatarResumeModule } from '@airesumecraft/shared'
import { NInput, NSpace } from 'naive-ui'

const props = defineProps<{
  module: AvatarResumeModule
}>()

const emit = defineEmits<{
  update: [patch: Partial<AvatarResumeModule['content']>]
}>()

function updateField(
  field: keyof AvatarResumeModule['content'],
  value: string,
) {
  emit('update', {
    [field]: value,
  })
}
</script>

<template>
  <NSpace vertical :size="10">
    <NInput
      :value="props.module.content.name"
      placeholder="Name"
      @update:value="(value) => updateField('name', value)"
    />
    <NInput
      :value="props.module.content.headline"
      placeholder="Headline"
      @update:value="(value) => updateField('headline', value)"
    />
    <NInput
      :value="props.module.content.email"
      placeholder="Email"
      @update:value="(value) => updateField('email', value)"
    />
    <NInput
      :value="props.module.content.phone"
      placeholder="Phone"
      @update:value="(value) => updateField('phone', value)"
    />
    <NInput
      :value="props.module.content.location"
      placeholder="Location"
      @update:value="(value) => updateField('location', value)"
    />
    <NInput
      :value="props.module.content.avatarUrl"
      placeholder="Avatar URL"
      @update:value="(value) => updateField('avatarUrl', value)"
    />
  </NSpace>
</template>
