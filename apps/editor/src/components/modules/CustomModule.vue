<script setup lang="ts">
import type {
  CustomListField,
  CustomResumeField,
  CustomResumeModule,
} from '@airesumecraft/shared'
import type { CustomModuleBuilderPayload } from '../CustomModuleBuilderDialog.vue'
import {
  createCustomListItem,
  normalizeCustomFields,
} from '@airesumecraft/shared'
import { NButton, NEmpty, NInput } from 'naive-ui'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Draggable from 'vuedraggable'
import CustomModuleBuilderDialog from '../CustomModuleBuilderDialog.vue'
import FieldControl from '../forms/FieldControl.vue'

const props = defineProps<{
  module: CustomResumeModule
}>()

const emit = defineEmits<{
  replaceSchema: [payload: CustomModuleBuilderPayload]
  update: [patch: Partial<CustomResumeModule['content']>]
}>()

const { t } = useI18n()
const showBuilder = ref(false)

const orderedFields = computed(() =>
  [...props.module.content.fields].sort(
    (left, right) => left.order - right.order,
  ),
)

function updateFields(fields: CustomResumeField[]) {
  emit('update', {
    fields: normalizeCustomFields(fields),
  })
}

function updateField(id: string, patch: Partial<CustomResumeField>) {
  updateFields(
    props.module.content.fields.map(field =>
      field.id === id
        ? ({
            ...field,
            ...patch,
          } as CustomResumeField)
        : field,
    ),
  )
}

function fieldSpanStyle(field: CustomResumeField) {
  return {
    '--custom-field-span': String(field.span),
  }
}

function fieldInputId(field: CustomResumeField) {
  return `custom-field-${props.module.id}-${field.id}`
}

function fieldLabel(field: CustomResumeField) {
  return field.label || t('editor.customModule.untitledField')
}

function listFieldItems(field: CustomResumeField) {
  return field.type === 'list' ? field.items : []
}

function updateListItems(id: string, items: CustomListField['items']) {
  updateFields(
    props.module.content.fields.map(field =>
      field.id === id && field.type === 'list'
        ? {
            ...field,
            items,
          }
        : field,
    ),
  )
}

function updateListItemsFromModel(id: string, value: unknown) {
  updateListItems(
    id,
    Array.isArray(value) ? (value as CustomListField['items']) : [],
  )
}

function updateListItem(
  field: CustomResumeField,
  itemId: string,
  text: string,
) {
  if (field.type !== 'list')
    return

  updateListItems(
    field.id,
    field.items.map(item =>
      item.id === itemId
        ? {
            ...item,
            text,
          }
        : item,
    ),
  )
}

function addListItem(field: CustomResumeField) {
  if (field.type !== 'list')
    return

  updateListItems(field.id, [...field.items, createCustomListItem()])
}

function removeListItem(field: CustomResumeField, itemId: string) {
  if (field.type !== 'list')
    return

  updateListItems(
    field.id,
    field.items.filter(item => item.id !== itemId),
  )
}

function replaceSchema(payload: CustomModuleBuilderPayload) {
  emit('replaceSchema', payload)
  showBuilder.value = false
}
</script>

<template>
  <section class="custom-module-editor">
    <header class="custom-module-editor-header">
      <NButton
        size="small"
        secondary
        data-testid="custom-module-edit-structure"
        @click="showBuilder = true"
      >
        {{ t('editor.customModule.editStructure') }}
      </NButton>
    </header>

    <NEmpty
      v-if="orderedFields.length === 0"
      :description="t('editor.customModule.emptyFields')"
    />

    <div v-else class="custom-module-field-grid">
      <div
        v-for="field in orderedFields"
        :key="field.id"
        class="custom-module-field"
        :style="fieldSpanStyle(field)"
        data-testid="custom-module-field"
      >
        <FieldControl
          :input-id="fieldInputId(field)"
          :label="fieldLabel(field)"
        >
          <NInput
            v-if="field.type === 'text'"
            :id="fieldInputId(field)"
            :value="field.value"
            data-testid="custom-module-text-input"
            :placeholder="field.placeholder"
            @update:value="(value) => updateField(field.id, { value })"
          />

          <NInput
            v-else-if="field.type === 'textarea'"
            :id="fieldInputId(field)"
            type="textarea"
            :value="field.value"
            data-testid="custom-module-textarea-input"
            :placeholder="field.placeholder"
            :autosize="{ minRows: field.minRows ?? 3, maxRows: 10 }"
            @update:value="(value) => updateField(field.id, { value })"
          />

          <div v-else class="custom-module-list-editor">
            <Draggable
              :model-value="listFieldItems(field)"
              item-key="id"
              handle=".custom-module-list-handle"
              class="custom-module-list-items"
              ghost-class="drag-ghost"
              :force-fallback="true"
              @update:model-value="updateListItemsFromModel(field.id, $event)"
            >
              <template #item="{ element: item }">
                <div class="custom-module-list-item">
                  <button
                    class="custom-module-list-handle"
                    type="button"
                    :aria-label="t('editor.actions.drag')"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8 7h8M8 12h8M8 17h8" />
                    </svg>
                  </button>
                  <NInput
                    :value="item.text"
                    data-testid="custom-module-list-item-input"
                    :placeholder="
                      field.placeholder || t('editor.customModule.listItem')
                    "
                    @update:value="
                      (value) => updateListItem(field, item.id, value)
                    "
                  />
                  <NButton
                    size="tiny"
                    quaternary
                    type="error"
                    @click="removeListItem(field, item.id)"
                  >
                    {{ t('editor.actions.remove') }}
                  </NButton>
                </div>
              </template>
            </Draggable>

            <NButton
              size="small"
              secondary
              data-testid="custom-module-add-list-item"
              @click="addListItem(field)"
            >
              {{ t('editor.customModule.addListItem') }}
            </NButton>
          </div>
        </FieldControl>
      </div>
    </div>

    <CustomModuleBuilderDialog
      v-model:show="showBuilder"
      :initial-module="module"
      @save="replaceSchema"
    />
  </section>
</template>
