<script setup lang="ts">
import type { ResumeModule } from '@airesumecraft/shared'
import { NEmpty } from 'naive-ui'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Draggable from 'vuedraggable'
import { useDragSelectionGuard } from '../composables/useDragSelectionGuard'
import { useResumeStore } from '../stores/resume'
import ModuleFrame from './ModuleFrame.vue'
import { getModuleComponent } from './modules/moduleRegistry'
import UnsupportedModule from './modules/UnsupportedModule.vue'

const store = useResumeStore()
const { t } = useI18n()
const { endDrag, startDrag } = useDragSelectionGuard()
const expandedModuleIds = ref<Set<string>>(new Set())
const isDraggingModule = ref(false)

const modules = computed({
  get: () => store.orderedModules,
  set: (value: ResumeModule[]) => {
    store.reorderModules(value)
  },
})

interface CanvasMoveEvent {
  draggedContext?: {
    element?: ResumeModule
    futureIndex?: number
  }
}

watch(
  () => store.orderedModules.map(module => module.id),
  (moduleIds, previousModuleIds) => {
    const previousIds = new Set(previousModuleIds ?? [])
    const nextExpandedIds = new Set(
      [...expandedModuleIds.value].filter(id => moduleIds.includes(id)),
    )

    if (previousModuleIds) {
      for (const moduleId of moduleIds) {
        if (!previousIds.has(moduleId))
          nextExpandedIds.add(moduleId)
      }
    }

    if (nextExpandedIds.size === 0 && moduleIds[0])
      nextExpandedIds.add(moduleIds[0])

    expandedModuleIds.value = nextExpandedIds
  },
  { immediate: true },
)

function selectAddedModule(event: { added?: { element: ResumeModule } }) {
  if (event.added) {
    expandedModuleIds.value = new Set([
      ...expandedModuleIds.value,
      event.added.element.id,
    ])
    store.selectModule(event.added.element.id)
  }
}

function syncPreviewOrderFromMove(event: CanvasMoveEvent) {
  const movedModule = event.draggedContext?.element
  const futureIndex = event.draggedContext?.futureIndex
  if (!movedModule || typeof futureIndex !== 'number')
    return true

  const nextModules = [...store.orderedModules]
  const currentIndex = nextModules.findIndex(
    module => module.id === movedModule.id,
  )
  if (currentIndex === -1)
    return true

  const [module] = nextModules.splice(currentIndex, 1)
  if (!module)
    return true

  const nextIndex = Math.min(Math.max(futureIndex, 0), nextModules.length)
  nextModules.splice(nextIndex, 0, module)
  store.setDragPreviewModuleOrder(nextModules.map(module => module.id))

  return true
}

function beginDrag() {
  isDraggingModule.value = true
  startDrag()
}

function finishDrag() {
  store.clearDragPreviewModuleOrder()
  endDrag()
  window.setTimeout(() => {
    isDraggingModule.value = false
  }, 0)
}

function updateModule(id: string, patch: Partial<ResumeModule['content']>) {
  store.updateModule(id, patch)
}

function isModuleExpanded(id: string) {
  return expandedModuleIds.value.has(id)
}

function toggleModule(id: string) {
  if (isDraggingModule.value)
    return

  store.selectModule(id)
  const nextExpandedIds = new Set(expandedModuleIds.value)

  if (nextExpandedIds.has(id))
    nextExpandedIds.delete(id)
  else nextExpandedIds.add(id)

  expandedModuleIds.value = nextExpandedIds
}

function removeModule(id: string) {
  expandedModuleIds.value = new Set(
    [...expandedModuleIds.value].filter(moduleId => moduleId !== id),
  )
  store.removeModule(id)
}

function renameModule(id: string, title: string) {
  store.renameModule(id, title)
}
</script>

<template>
  <section class="editor-panel canvas-panel">
    <header class="editor-panel-header">
      <span>{{ t('editor.panels.canvas') }}</span>
    </header>

    <Draggable
      v-model="modules"
      item-key="id"
      handle=".module-frame-header"
      ghost-class="drag-ghost"
      :move="syncPreviewOrderFromMove"
      :force-fallback="true"
      :group="{ name: 'resume-modules', pull: true, put: true }"
      class="canvas-list"
      data-testid="resume-canvas-list"
      @change="selectAddedModule"
      @end="finishDrag"
      @start="beginDrag"
    >
      <template #item="{ element }">
        <ModuleFrame
          :expanded="isModuleExpanded(element.id)"
          :module="element"
          :selected="element.id === store.selectedModuleId"
          @select="store.selectModule(element.id)"
          @toggle="toggleModule(element.id)"
          @rename="renameModule(element.id, $event)"
          @remove="removeModule(element.id)"
        >
          <component
            :is="getModuleComponent(element.type) ?? UnsupportedModule"
            :module="element"
            :type="element.type"
            @update="updateModule(element.id, $event)"
          />
        </ModuleFrame>
      </template>
    </Draggable>

    <NEmpty
      v-if="store.orderedModules.length === 0"
      class="canvas-empty"
      :description="t('editor.empty.canvas')"
    />
  </section>
</template>
