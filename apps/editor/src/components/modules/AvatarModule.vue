<script setup lang="ts">
import type { AvatarResumeModule } from '@airesumecraft/shared'
import { NInput } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import FieldControl from '../forms/FieldControl.vue'
import FieldGrid from '../forms/FieldGrid.vue'

const props = defineProps<{
  module: AvatarResumeModule
}>()

const emit = defineEmits<{
  update: [patch: Partial<AvatarResumeModule['content']>]
}>()

const { t } = useI18n()

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
  <FieldGrid>
    <FieldControl :label="t('editor.fields.name')">
      <NInput
        :value="props.module.content.name"
        :placeholder="t('editor.fields.name')"
        data-testid="avatar-name-input"
        @update:value="(value) => updateField('name', value)"
      />
    </FieldControl>

    <FieldControl :label="t('editor.fields.headline')">
      <NInput
        :value="props.module.content.headline"
        :placeholder="t('editor.fields.headline')"
        @update:value="(value) => updateField('headline', value)"
      />
    </FieldControl>

    <FieldControl :label="t('editor.fields.phone')">
      <NInput
        :value="props.module.content.phone"
        :placeholder="t('editor.fields.phone')"
        @update:value="(value) => updateField('phone', value)"
      />
    </FieldControl>

    <FieldControl :label="t('editor.fields.email')">
      <NInput
        :value="props.module.content.email"
        :placeholder="t('editor.fields.email')"
        @update:value="(value) => updateField('email', value)"
      />
    </FieldControl>

    <FieldControl :label="t('editor.fields.location')">
      <NInput
        :value="props.module.content.location"
        :placeholder="t('editor.fields.location')"
        @update:value="(value) => updateField('location', value)"
      />
    </FieldControl>

    <FieldControl :label="t('editor.fields.profileUrl')">
      <NInput
        :value="props.module.content.profileUrl"
        :placeholder="t('editor.fields.profileUrl')"
        @update:value="(value) => updateField('profileUrl', value)"
      />
    </FieldControl>

    <FieldControl :label="t('editor.fields.avatarUrl')">
      <NInput
        :value="props.module.content.avatarUrl"
        :placeholder="t('editor.fields.avatarUrl')"
        @update:value="(value) => updateField('avatarUrl', value)"
      />
    </FieldControl>
  </FieldGrid>
</template>
