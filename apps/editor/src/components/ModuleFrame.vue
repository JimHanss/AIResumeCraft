<script setup lang="ts">
import type { ResumeModule } from '@airesumecraft/shared'
import { NButton, NInput, NModal, NSpace, NTag } from 'naive-ui'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  expanded: boolean
  module: ResumeModule
  selected: boolean
}>()

const emit = defineEmits<{
  remove: []
  rename: [title: string]
  select: []
  toggle: []
}>()

const { t } = useI18n()
const showRenameModal = ref(false)
const draftTitle = ref('')
const moduleTitle = computed(
  () => props.module.title || t(`modules.${props.module.type}.title`),
)
const canSaveTitle = computed(() => draftTitle.value.trim().length > 0)

function openRenameModal() {
  draftTitle.value = moduleTitle.value
  showRenameModal.value = true
}

function confirmRename() {
  if (!canSaveTitle.value)
    return

  emit('rename', draftTitle.value.trim())
  showRenameModal.value = false
}
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
    <header
      class="module-frame-header"
      :data-testid="`module-drag-${module.id}`"
      :aria-label="t('editor.actions.drag')"
      :title="t('editor.actions.drag')"
      @click.stop="emit('toggle')"
    >
      <div class="module-frame-leading">
        <button
          class="module-toggle-button"
          type="button"
          :aria-expanded="expanded"
          :aria-label="
            expanded ? t('editor.actions.collapse') : t('editor.actions.expand')
          "
          :title="
            expanded ? t('editor.actions.collapse') : t('editor.actions.expand')
          "
          @click.stop="emit('toggle')"
        >
          <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
            <path v-if="expanded" d="m6 9 6 6 6-6" />
            <path v-else d="m9 6 6 6-6 6" />
          </svg>
        </button>
      </div>

      <button
        class="module-title-drag-zone"
        type="button"
        @click.stop="emit('toggle')"
      >
        <strong>{{ moduleTitle }}</strong>
        <NTag size="small" round type="info">
          {{ t(`modules.${module.type}.badge`) }}
        </NTag>
      </button>

      <NSpace class="module-frame-actions" :wrap="false" size="small">
        <NButton
          size="tiny"
          quaternary
          data-testid="module-title-edit"
          @click.stop="openRenameModal"
        >
          {{ t('editor.actions.edit') }}
        </NButton>
        <NButton
          size="tiny"
          quaternary
          type="error"
          @click.stop="emit('remove')"
        >
          {{ t('editor.actions.remove') }}
        </NButton>
      </NSpace>
    </header>

    <div v-if="expanded" class="module-frame-body">
      <slot />
    </div>

    <NModal
      v-model:show="showRenameModal"
      preset="card"
      class="module-rename-modal"
      :style="{ width: 'min(420px, calc(100vw - 32px))' }"
      :title="t('editor.actions.renameModule')"
      :bordered="false"
    >
      <NInput
        v-model:value="draftTitle"
        :placeholder="t('editor.fields.moduleTitle')"
        data-testid="module-title-input"
        @keyup.enter="confirmRename"
      />

      <template #footer>
        <NSpace justify="end">
          <NButton @click="showRenameModal = false">
            {{ t('editor.actions.cancel') }}
          </NButton>
          <NButton
            type="primary"
            :disabled="!canSaveTitle"
            data-testid="module-title-save"
            @click="confirmRename"
          >
            {{ t('editor.actions.save') }}
          </NButton>
        </NSpace>
      </template>
    </NModal>
  </section>
</template>
