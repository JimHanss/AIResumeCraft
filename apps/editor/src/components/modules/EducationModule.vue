<script setup lang="ts">
import type {
  EducationResumeItem,
  EducationResumeModule,
} from '@airesumecraft/shared'
import { createEducationItem } from '@airesumecraft/shared'
import { NButton, NInput, NSpace } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import FieldControl from '../forms/FieldControl.vue'
import FieldGrid from '../forms/FieldGrid.vue'

const props = defineProps<{
  module: EducationResumeModule
}>()

const emit = defineEmits<{
  update: [patch: Partial<EducationResumeModule['content']>]
}>()

const { t } = useI18n()

function updateItems(items: EducationResumeItem[]) {
  emit('update', { items })
}

function updateItem<K extends keyof EducationResumeItem>(
  id: string,
  field: K,
  value: EducationResumeItem[K],
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
  updateItems([...props.module.content.items, createEducationItem()])
}

function removeItem(id: string) {
  const nextItems = props.module.content.items.filter(item => item.id !== id)
  updateItems(nextItems.length > 0 ? nextItems : [createEducationItem()])
}
</script>

<template>
  <NSpace vertical :size="14">
    <section
      v-for="item in props.module.content.items"
      :key="item.id"
      class="education-item"
    >
      <NSpace vertical :size="8">
        <FieldGrid>
          <FieldControl :label="t('editor.fields.school')">
            <NInput
              :value="item.school"
              :placeholder="t('editor.fields.school')"
              data-testid="education-school-input"
              @update:value="(value) => updateItem(item.id, 'school', value)"
            />
          </FieldControl>

          <FieldControl :label="t('editor.fields.degree')">
            <NInput
              :value="item.degree"
              :placeholder="t('editor.fields.degree')"
              @update:value="(value) => updateItem(item.id, 'degree', value)"
            />
          </FieldControl>

          <FieldControl :label="t('editor.fields.field')">
            <NInput
              :value="item.field"
              :placeholder="t('editor.fields.field')"
              @update:value="(value) => updateItem(item.id, 'field', value)"
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
              :value="item.endDate"
              :placeholder="t('editor.fields.endDate')"
              @update:value="(value) => updateItem(item.id, 'endDate', value)"
            />
          </FieldControl>

          <FieldControl :label="t('editor.fields.gpa')">
            <NInput
              :value="item.gpa"
              :placeholder="t('editor.fields.gpa')"
              @update:value="(value) => updateItem(item.id, 'gpa', value)"
            />
          </FieldControl>

          <FieldControl :label="t('editor.fields.honors')">
            <NInput
              :value="item.honors"
              :placeholder="t('editor.fields.honors')"
              @update:value="(value) => updateItem(item.id, 'honors', value)"
            />
          </FieldControl>
        </FieldGrid>

        <FieldControl :label="t('editor.fields.coursework')">
          <NInput
            :value="item.coursework"
            :placeholder="t('editor.fields.coursework')"
            @update:value="(value) => updateItem(item.id, 'coursework', value)"
          />
        </FieldControl>

        <FieldControl :label="t('editor.fields.educationDescription')">
          <NInput
            type="textarea"
            :value="item.description"
            :placeholder="t('editor.fields.educationDescription')"
            :autosize="{ minRows: 2, maxRows: 5 }"
            @update:value="(value) => updateItem(item.id, 'description', value)"
          />
        </FieldControl>

        <NButton
          quaternary
          type="error"
          size="small"
          @click="removeItem(item.id)"
        >
          {{ t('editor.actions.removeEducation') }}
        </NButton>
      </NSpace>
    </section>

    <NButton secondary type="primary" @click="addItem">
      {{ t('editor.actions.addEducation') }}
    </NButton>
  </NSpace>
</template>
