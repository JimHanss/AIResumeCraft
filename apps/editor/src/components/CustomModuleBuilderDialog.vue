<script setup lang="ts">
import type {
  CustomFieldSpan,
  CustomFieldType,
  CustomListField,
  CustomResumeField,
  CustomResumeModule,
} from '@airesumecraft/shared'
import {
  createCustomField,
  createCustomListItem,
  normalizeCustomFields,
} from '@airesumecraft/shared'
import { NButton, NEmpty, NInput, NModal, NSelect } from 'naive-ui'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Draggable from 'vuedraggable'

export interface CustomModuleBuilderPayload {
  content: CustomResumeModule['content']
  title: string
}

const props = defineProps<{
  initialModule?: CustomResumeModule
  show: boolean
}>()

const emit = defineEmits<{
  'cancel': []
  'save': [payload: CustomModuleBuilderPayload]
  'update:show': [value: boolean]
}>()

const { t } = useI18n()

const title = ref('')
const fields = ref<CustomResumeField[]>([])
const titleTouched = ref(false)

const fieldTypeOptions = computed(
  () =>
    [
      { label: t('editor.customModule.fieldTypes.text'), value: 'text' },
      {
        label: t('editor.customModule.fieldTypes.textarea'),
        value: 'textarea',
      },
      { label: t('editor.customModule.fieldTypes.list'), value: 'list' },
    ] satisfies Array<{ label: string, value: CustomFieldType }>,
)
const spanOptions = computed(
  () =>
    [
      { label: t('editor.customModule.spans.full'), value: 12 },
      { label: t('editor.customModule.spans.half'), value: 6 },
      { label: t('editor.customModule.spans.third'), value: 4 },
    ] satisfies Array<{ label: string, value: CustomFieldSpan }>,
)

const titleError = computed(() =>
  titleTouched.value && !title.value.trim()
    ? t('editor.customModule.validation.titleRequired')
    : '',
)

watch(
  () => props.show,
  (show) => {
    if (show)
      resetDraft()
  },
)

watch(
  () => props.initialModule?.id,
  () => {
    if (props.show)
      resetDraft()
  },
)

function resetDraft() {
  titleTouched.value = false
  title.value = props.initialModule?.title ?? ''
  fields.value = props.initialModule
    ? structuredClone(props.initialModule.content.fields)
    : [
        createCustomField('text', {
          label: t('editor.customModule.defaults.textLabel'),
          order: 1,
          placeholder: t('editor.customModule.defaults.textPlaceholder'),
          span: 6,
        }),
      ]
}

function closeDialog() {
  emit('update:show', false)
  emit('cancel')
}

function addField(type: CustomFieldType) {
  const order = fields.value.length + 1
  const label = t(`editor.customModule.defaults.${type}Label`)
  fields.value = normalizeCustomFields([
    ...fields.value,
    createCustomField(type, {
      label,
      order,
      placeholder: label,
      span: type === 'textarea' || type === 'list' ? 12 : 6,
    }),
  ])
}

function removeField(id: string) {
  fields.value = normalizeCustomFields(
    fields.value.filter(field => field.id !== id),
  )
}

function updateField(id: string, patch: Partial<CustomResumeField>) {
  fields.value = fields.value.map(field =>
    field.id === id
      ? ({
          ...field,
          ...patch,
        } as CustomResumeField)
      : field,
  )
}

function updateFieldType(id: string, type: CustomFieldType) {
  fields.value = fields.value.map((field) => {
    if (field.id !== id || field.type === type)
      return field

    return createCustomField(type, {
      id: field.id,
      label: field.label,
      order: field.order,
      placeholder: field.placeholder,
      span: field.span,
    })
  })
}

function normalizeFieldOrder() {
  fields.value = normalizeCustomFields(fields.value)
}

function fieldSpanStyle(field: CustomResumeField) {
  return {
    '--custom-field-span': String(field.span),
  }
}

function listFieldItems(field: CustomResumeField) {
  return field.type === 'list' ? field.items : []
}

function updateListItems(id: string, items: CustomListField['items']) {
  fields.value = fields.value.map(field =>
    field.id === id && field.type === 'list'
      ? {
          ...field,
          items,
        }
      : field,
  )
}

function updateListItemsFromModel(id: string, value: unknown) {
  updateListItems(
    id,
    Array.isArray(value) ? (value as CustomListField['items']) : [],
  )
}

function addListItem(field: CustomResumeField) {
  if (field.type !== 'list')
    return

  updateListItems(field.id, [...field.items, createCustomListItem()])
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

function removeListItem(field: CustomResumeField, itemId: string) {
  if (field.type !== 'list')
    return

  updateListItems(
    field.id,
    field.items.filter(item => item.id !== itemId),
  )
}

function save() {
  titleTouched.value = true
  if (!title.value.trim())
    return

  emit('save', {
    title: title.value.trim(),
    content: {
      fields: normalizeCustomFields(fields.value),
    },
  })
  emit('update:show', false)
}
</script>

<template>
  <NModal
    :show="show"
    :mask-closable="false"
    preset="card"
    class="custom-module-builder-modal"
    :title="t('editor.customModule.dialogTitle')"
    @update:show="(value) => emit('update:show', value)"
  >
    <div class="custom-module-builder">
      <div class="custom-module-builder-scroll">
        <section class="custom-module-builder-section">
          <label class="custom-builder-label">
            <span>{{ t('editor.customModule.moduleName') }}</span>
            <NInput
              v-model:value="title"
              data-testid="custom-module-title-input"
              :placeholder="t('editor.customModule.moduleNamePlaceholder')"
              :status="titleError ? 'error' : undefined"
              @blur="titleTouched = true"
            />
          </label>
          <p
            class="custom-builder-error"
            data-testid="custom-module-title-error"
          >
            {{ titleError }}
          </p>
        </section>

        <section class="custom-module-builder-section">
          <strong>{{ t('editor.customModule.fields') }}</strong>

          <NEmpty
            v-if="fields.length === 0"
            :description="t('editor.customModule.emptyFields')"
          />

          <Draggable
            v-else
            v-model="fields"
            item-key="id"
            handle=".custom-builder-field-handle"
            class="custom-builder-field-list custom-builder-live-preview"
            ghost-class="drag-ghost"
            :force-fallback="true"
            @end="normalizeFieldOrder"
          >
            <template #item="{ element: field, index }">
              <article
                class="custom-builder-field"
                :style="fieldSpanStyle(field)"
                data-testid="custom-field"
              >
                <header class="custom-builder-field-header">
                  <button
                    class="custom-builder-field-handle"
                    type="button"
                    :aria-label="t('editor.actions.drag')"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8 7h8M8 12h8M8 17h8" />
                    </svg>
                  </button>

                  <NInput
                    :value="field.label"
                    class="custom-builder-title-input"
                    data-testid="custom-field-label-input"
                    size="small"
                    :bordered="false"
                    :placeholder="`${t('editor.customModule.fieldLabel')} ${index + 1}`"
                    @update:value="
                      (value) => updateField(field.id, { label: value })
                    "
                  />

                  <NButton
                    class="custom-builder-remove-button"
                    size="tiny"
                    quaternary
                    circle
                    type="error"
                    data-testid="custom-field-remove"
                    :aria-label="t('editor.customModule.removeField')"
                    :title="t('editor.customModule.removeField')"
                    @click="removeField(field.id)"
                  >
                    <svg
                      class="button-icon"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v5" />
                      <path d="M14 11v5" />
                    </svg>
                  </NButton>
                </header>

                <div
                  class="custom-builder-placeholder-shell"
                  :class="{ 'is-tall': field.type === 'textarea' }"
                >
                  <NInput
                    v-if="field.type === 'textarea'"
                    :value="field.placeholder"
                    data-testid="custom-field-placeholder-input"
                    size="small"
                    type="textarea"
                    :bordered="false"
                    :autosize="{ minRows: field.minRows ?? 3, maxRows: 4 }"
                    :placeholder="t('editor.customModule.placeholder')"
                    @update:value="
                      (value) => updateField(field.id, { placeholder: value })
                    "
                  />
                  <NInput
                    v-else
                    :value="field.placeholder"
                    data-testid="custom-field-placeholder-input"
                    size="small"
                    :bordered="false"
                    :placeholder="t('editor.customModule.placeholder')"
                    @update:value="
                      (value) => updateField(field.id, { placeholder: value })
                    "
                  />

                  <div class="custom-builder-inline-controls">
                    <NSelect
                      :value="field.type"
                      :options="fieldTypeOptions"
                      class="custom-builder-inline-select custom-builder-type-select"
                      data-testid="custom-field-type-select"
                      size="small"
                      :bordered="false"
                      @update:value="
                        (value) =>
                          updateFieldType(field.id, value as CustomFieldType)
                      "
                    />
                    <NSelect
                      :value="field.span"
                      :options="spanOptions"
                      class="custom-builder-inline-select custom-builder-span-select"
                      data-testid="custom-field-span-select"
                      size="small"
                      :bordered="false"
                      @update:value="
                        (value) =>
                          updateField(field.id, {
                            span: value as CustomFieldSpan,
                          })
                      "
                    />
                  </div>
                </div>

                <div
                  v-if="field.type === 'list'"
                  class="custom-builder-list-config"
                >
                  <Draggable
                    :model-value="listFieldItems(field)"
                    item-key="id"
                    handle=".custom-builder-list-handle"
                    class="custom-builder-list-items"
                    ghost-class="drag-ghost"
                    :force-fallback="true"
                    @update:model-value="
                      updateListItemsFromModel(field.id, $event)
                    "
                  >
                    <template #item="{ element: item }">
                      <div class="custom-builder-list-item">
                        <button
                          class="custom-builder-list-handle"
                          type="button"
                          :aria-label="t('editor.actions.drag')"
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M8 7h8M8 12h8M8 17h8" />
                          </svg>
                        </button>
                        <NInput
                          :value="item.text"
                          data-testid="custom-builder-list-item-input"
                          size="small"
                          :placeholder="
                            field.placeholder
                              || t('editor.customModule.listItem')
                          "
                          @update:value="
                            (value) => updateListItem(field, item.id, value)
                          "
                        />
                        <NButton
                          size="tiny"
                          quaternary
                          circle
                          type="error"
                          :aria-label="t('editor.actions.remove')"
                          :title="t('editor.actions.remove')"
                          @click="removeListItem(field, item.id)"
                        >
                          <svg
                            class="button-icon"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path d="M3 6h18" />
                            <path d="M8 6V4h8v2" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v5" />
                            <path d="M14 11v5" />
                          </svg>
                        </NButton>
                      </div>
                    </template>
                  </Draggable>

                  <NButton size="small" secondary @click="addListItem(field)">
                    {{ t('editor.customModule.addListItem') }}
                  </NButton>
                </div>
              </article>
            </template>
          </Draggable>

          <div class="custom-builder-add-actions">
            <NButton
              size="small"
              secondary
              data-testid="custom-add-text-field"
              @click="addField('text')"
            >
              {{ t('editor.customModule.addTextField') }}
            </NButton>
            <NButton
              size="small"
              secondary
              data-testid="custom-add-textarea-field"
              @click="addField('textarea')"
            >
              {{ t('editor.customModule.addTextareaField') }}
            </NButton>
            <NButton
              size="small"
              secondary
              data-testid="custom-add-list-field"
              @click="addField('list')"
            >
              {{ t('editor.customModule.addListField') }}
            </NButton>
          </div>
        </section>
      </div>

      <footer class="custom-module-builder-actions">
        <NButton secondary @click="closeDialog">
          {{ t('editor.actions.cancel') }}
        </NButton>
        <NButton type="primary" data-testid="custom-module-save" @click="save">
          {{ t('editor.actions.save') }}
        </NButton>
      </footer>
    </div>
  </NModal>
</template>
