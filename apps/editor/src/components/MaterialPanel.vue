<script setup lang="ts">
import type { ResumeModuleMaterial } from '../stores/resume'
import { NButton, NSwitch } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import Draggable from 'vuedraggable'
import { useDragSelectionGuard } from '../composables/useDragSelectionGuard'
import { useResumeStore } from '../stores/resume'

const store = useResumeStore()
const { t } = useI18n()
const { clearTextSelection, endDrag, startDrag } = useDragSelectionGuard()

const moduleIcons = {
  avatar: [
    'M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18.5z',
    'M8.5 8.75a2.25 2.25 0 1 0 4.5 0 2.25 2.25 0 0 0-4.5 0z',
    'M7.25 17a4.25 4.25 0 0 1 7.5 0',
    'M15.5 8h2',
    'M15.5 12h2',
  ],
  summary: [
    'M6 3.5h8.5L18 7v13.5H6z',
    'M14.5 3.5V7H18',
    'M8.5 10h7',
    'M8.5 13.5h7',
    'M8.5 17h4.5',
  ],
  education: [
    'M3.5 9 12 4l8.5 5-8.5 5z',
    'M6.5 11v4.25c1.7 1.35 3.55 2 5.5 2s3.8-.65 5.5-2V11',
    'M20.5 9v5.5',
  ],
  experience: [
    'M8.5 7V5.5A2.5 2.5 0 0 1 11 3h2a2.5 2.5 0 0 1 2.5 2.5V7',
    'M4 7h16v11.5A2.5 2.5 0 0 1 17.5 21h-11A2.5 2.5 0 0 1 4 18.5z',
    'M4 12h16',
    'M10 12v2h4v-2',
  ],
  skills: [
    'M8.5 8.5 5 12l3.5 3.5',
    'M15.5 8.5 19 12l-3.5 3.5',
    'M13.5 6.5 10.5 17.5',
    'M4.5 20h15',
  ],
} satisfies Record<ResumeModuleMaterial['type'], string[]>

function cloneMaterial(material: ResumeModuleMaterial) {
  return store.createModule(material.type)
}

function addModule() {
  store.addFirstInactiveModule()
}

function moduleIconPaths(type: ResumeModuleMaterial['type']) {
  return moduleIcons[type]
}

function toggleModule(material: ResumeModuleMaterial, enabled: boolean) {
  store.toggleModuleType(material.type, enabled)
}
</script>

<template>
  <aside class="module-picker">
    <header class="module-picker-header">
      <strong>{{ t('editor.panels.moduleSelection') }}</strong>
      <span class="module-picker-menu" aria-hidden="true" />
    </header>

    <Draggable
      :model-value="store.availableMaterials"
      item-key="type"
      :sort="false"
      :clone="cloneMaterial"
      :force-fallback="true"
      :group="{ name: 'resume-modules', pull: 'clone', put: false }"
      class="material-list"
      data-testid="material-list"
      @end="endDrag"
      @start="startDrag"
    >
      <template #item="{ element }">
        <div
          class="module-picker-item"
          :class="{ active: store.activeModuleTypes.has(element.type) }"
          :data-testid="`material-${element.type}`"
          @pointerdown="clearTextSelection"
        >
          <span class="module-picker-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false" role="img">
              <path
                v-for="path in moduleIconPaths(element.type)"
                :key="path"
                :d="path"
              />
            </svg>
          </span>
          <strong>{{ t(`modules.${element.type}.title`) }}</strong>
          <NSwitch
            size="small"
            :round="false"
            :value="store.activeModuleTypes.has(element.type)"
            @click.stop
            @update:value="(value) => toggleModule(element, value)"
          />
        </div>
      </template>
    </Draggable>

    <NButton
      class="module-picker-add"
      type="primary"
      round
      data-testid="module-add"
      @click="addModule"
    >
      <span class="module-picker-add-icon" aria-hidden="true">+</span>
      {{ t('editor.actions.addModule') }}
    </NButton>
  </aside>
</template>
