<script setup lang="ts">
import type { ResumeModuleMaterial } from '../stores/resume'
import { NButton, NCard, NText } from 'naive-ui'
import Draggable from 'vuedraggable'
import { useResumeStore } from '../stores/resume'

const store = useResumeStore()

function cloneMaterial(material: ResumeModuleMaterial) {
  return store.createModule(material.type)
}

function addMaterial(material: ResumeModuleMaterial) {
  store.addModule(material.type)
}
</script>

<template>
  <NCard title="Materials" size="small">
    <Draggable
      :model-value="store.availableMaterials"
      item-key="type"
      :sort="false"
      :clone="cloneMaterial"
      :force-fallback="true"
      :group="{ name: 'resume-modules', pull: 'clone', put: false }"
      class="material-list"
      data-testid="material-list"
    >
      <template #item="{ element }">
        <div class="material-item" :data-testid="`material-${element.type}`">
          <div>
            <strong>{{ element.title }}</strong>
            <NText depth="3">
              {{ element.description }}
            </NText>
          </div>
          <NButton
            size="small"
            secondary
            :data-testid="`material-add-${element.type}`"
            @click="addMaterial(element)"
          >
            Add
          </NButton>
        </div>
      </template>
    </Draggable>
  </NCard>
</template>
