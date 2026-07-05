<script setup lang="ts">
import type {
  ExperienceResumeItem,
  ExperienceResumeModule,
} from '@airesumecraft/shared'
import { createExperienceItem } from '@airesumecraft/shared'
import { NButton, NCheckbox, NInput, NSpace } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import FieldControl from '../forms/FieldControl.vue'
import FieldGrid from '../forms/FieldGrid.vue'

const props = defineProps<{
  module: ExperienceResumeModule
}>()

const emit = defineEmits<{
  update: [patch: Partial<ExperienceResumeModule['content']>]
}>()

const { t } = useI18n()

function updateItems(items: ExperienceResumeItem[]) {
  emit('update', { items })
}

function updateItem<K extends keyof ExperienceResumeItem>(
  id: string,
  field: K,
  value: ExperienceResumeItem[K],
) {
  updateItems(
    props.module.content.items.map(item =>
      item.id === id
        ? {
            ...item,
            [field]: value,
          }
        : item,
    ),
  )
}

function addItem() {
  updateItems([...props.module.content.items, createExperienceItem()])
}

function removeItem(id: string) {
  const nextItems = props.module.content.items.filter(item => item.id !== id)
  updateItems(nextItems.length > 0 ? nextItems : [createExperienceItem()])
}
</script>

<template>
  <NSpace vertical :size="14">
    <section
      v-for="item in props.module.content.items"
      :key="item.id"
      class="experience-item"
    >
      <NSpace vertical :size="8">
        <FieldGrid>
          <FieldControl :label="t('editor.fields.company')">
            <NInput
              :value="item.company"
              :placeholder="t('editor.fields.company')"
              @update:value="(value) => updateItem(item.id, 'company', value)"
            />
          </FieldControl>

          <FieldControl :label="t('editor.fields.role')">
            <NInput
              :value="item.role"
              :placeholder="t('editor.fields.role')"
              @update:value="(value) => updateItem(item.id, 'role', value)"
            />
          </FieldControl>

          <FieldControl :label="t('editor.fields.location')">
            <NInput
              :value="item.location"
              :placeholder="t('editor.fields.location')"
              @update:value="(value) => updateItem(item.id, 'location', value)"
            />
          </FieldControl>

          <FieldControl :label="t('editor.fields.startDate')">
            <NInput
              :value="item.startDate"
              :placeholder="t('editor.fields.startDate')"
              @update:value="(value) => updateItem(item.id, 'startDate', value)"
            />
          </FieldControl>

          <FieldControl :label="t('editor.fields.endDate')">
            <NInput
              :disabled="item.current"
              :value="item.endDate"
              :placeholder="t('editor.fields.endDate')"
              @update:value="(value) => updateItem(item.id, 'endDate', value)"
            />
          </FieldControl>

          <FieldControl :label="t('editor.fields.currentRole')">
            <NCheckbox
              :checked="item.current"
              @update:checked="(value) => updateItem(item.id, 'current', value)"
            >
              {{ t('editor.fields.currentRole') }}
            </NCheckbox>
          </FieldControl>
        </FieldGrid>

        <FieldControl :label="t('editor.fields.experienceDescription')">
          <NInput
            type="textarea"
            :value="item.description"
            :placeholder="t('editor.fields.experienceDescription')"
            :autosize="{ minRows: 3, maxRows: 6 }"
            @update:value="(value) => updateItem(item.id, 'description', value)"
          />
        </FieldControl>

        <NButton
          quaternary
          type="error"
          size="small"
          @click="removeItem(item.id)"
        >
          {{ t('editor.actions.removeExperience') }}
        </NButton>
      </NSpace>
    </section>

    <NButton secondary type="primary" @click="addItem">
      {{ t('editor.actions.addExperience') }}
    </NButton>
  </NSpace>
</template>
