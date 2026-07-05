<script setup lang="ts">
import type { ExperienceResumeModule } from '@airesumecraft/shared'
import { createExperienceItem } from '@airesumecraft/shared'
import { NButton, NInput, NSpace } from 'naive-ui'

const props = defineProps<{
  module: ExperienceResumeModule
}>()

const emit = defineEmits<{
  update: [patch: Partial<ExperienceResumeModule['content']>]
}>()

type ExperienceItem = ExperienceResumeModule['content']['items'][number]

function updateItems(items: ExperienceItem[]) {
  emit('update', { items })
}

function updateItem(id: string, field: keyof ExperienceItem, value: string) {
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
        <NInput
          :value="item.company"
          placeholder="Company"
          @update:value="(value) => updateItem(item.id, 'company', value)"
        />
        <NInput
          :value="item.role"
          placeholder="Role"
          @update:value="(value) => updateItem(item.id, 'role', value)"
        />
        <NSpace :wrap="false">
          <NInput
            :value="item.startDate"
            placeholder="Start"
            @update:value="(value) => updateItem(item.id, 'startDate', value)"
          />
          <NInput
            :value="item.endDate"
            placeholder="End"
            @update:value="(value) => updateItem(item.id, 'endDate', value)"
          />
        </NSpace>
        <NInput
          type="textarea"
          :value="item.description"
          placeholder="Impact, scope, and measurable results"
          :autosize="{ minRows: 3, maxRows: 6 }"
          @update:value="(value) => updateItem(item.id, 'description', value)"
        />
        <NButton
          quaternary
          type="error"
          size="small"
          @click="removeItem(item.id)"
        >
          Remove experience
        </NButton>
      </NSpace>
    </section>

    <NButton secondary type="primary" @click="addItem">
      Add experience
    </NButton>
  </NSpace>
</template>
