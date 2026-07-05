<script setup lang="ts">
import type { ResumeModule } from '@airesumecraft/shared'
import { NCard, NEmpty } from 'naive-ui'
import { computed } from 'vue'
import Draggable from 'vuedraggable'
import { useResumeStore } from '../stores/resume'
import ModuleFrame from './ModuleFrame.vue'
import { getModuleComponent } from './modules/moduleRegistry'
import UnsupportedModule from './modules/UnsupportedModule.vue'

const store = useResumeStore()

const modules = computed({
  get: () => store.orderedModules,
  set: (value: ResumeModule[]) => {
    store.reorderModules(value)
  },
})

function selectAddedModule(event: { added?: { element: ResumeModule } }) {
  if (event.added)
    store.selectModule(event.added.element.id)
}

function updateModule(id: string, patch: Partial<ResumeModule['content']>) {
  store.updateModule(id, patch)
}
</script>

<template>
  <NCard title="Canvas" size="small" class="canvas-panel">
    <Draggable
      v-model="modules"
      item-key="id"
      handle=".drag-handle"
      ghost-class="drag-ghost"
      :force-fallback="true"
      :group="{ name: 'resume-modules', pull: true, put: true }"
      class="canvas-list"
      data-testid="resume-canvas-list"
      @change="selectAddedModule"
    >
      <template #item="{ element }">
        <ModuleFrame
          :module="element"
          :selected="element.id === store.selectedModuleId"
          @select="store.selectModule(element.id)"
          @duplicate="store.duplicateModule(element.id)"
          @remove="store.removeModule(element.id)"
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
      description="Drag materials here to build a resume."
    />
  </NCard>
</template>
