<script setup lang="ts">
import type { SkillGroup, SkillsResumeModule } from '@airesumecraft/shared'
import { createSkillGroup } from '@airesumecraft/shared'
import { NButton, NInput, NSpace } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import FieldControl from '../forms/FieldControl.vue'

const props = defineProps<{
  module: SkillsResumeModule
}>()

const emit = defineEmits<{
  update: [patch: Partial<SkillsResumeModule['content']>]
}>()

const { t } = useI18n()

function withFallbackGroup(groups: SkillGroup[]) {
  return groups.length > 0 ? groups : [createSkillGroup()]
}

function updateGroups(groups: SkillGroup[]) {
  emit('update', { groups: withFallbackGroup(groups) })
}

function updateGroup(id: string, patch: Partial<SkillGroup>) {
  updateGroups(
    props.module.content.groups.map(group =>
      group.id === id
        ? {
            ...group,
            ...patch,
          }
        : group,
    ),
  )
}

function addGroup() {
  updateGroups([...props.module.content.groups, createSkillGroup()])
}

function removeGroup(id: string) {
  updateGroups(props.module.content.groups.filter(group => group.id !== id))
}

function updateSkill(groupId: string, index: number, value: string) {
  const group = props.module.content.groups.find(item => item.id === groupId)
  if (!group)
    return

  const skills = [...group.skills]
  skills[index] = value
  updateGroup(groupId, { skills })
}

function addSkill(groupId: string) {
  const group = props.module.content.groups.find(item => item.id === groupId)
  if (!group)
    return

  updateGroup(groupId, { skills: [...group.skills, ''] })
}

function removeSkill(groupId: string, index: number) {
  const group = props.module.content.groups.find(item => item.id === groupId)
  if (!group)
    return

  const skills = group.skills.filter((_, skillIndex) => skillIndex !== index)
  updateGroup(groupId, { skills: skills.length > 0 ? skills : [''] })
}
</script>

<template>
  <NSpace vertical :size="14">
    <section
      v-for="group in props.module.content.groups"
      :key="group.id"
      class="skill-group-editor"
    >
      <NSpace vertical :size="8">
        <FieldControl :label="t('editor.fields.skillGroup')">
          <NInput
            :value="group.name"
            :placeholder="t('editor.fields.skillGroup')"
            data-testid="skill-group-name-input"
            @update:value="(value) => updateGroup(group.id, { name: value })"
          />
        </FieldControl>

        <div class="skill-item-list">
          <FieldControl
            v-for="(skill, index) in group.skills"
            :key="`${group.id}-${index}`"
            :label="`${t('editor.fields.skill')} ${index + 1}`"
          >
            <div class="skill-item-row">
              <NInput
                :value="skill"
                :placeholder="t('editor.fields.skill')"
                data-testid="skill-item-input"
                @update:value="(value) => updateSkill(group.id, index, value)"
              />
              <NButton
                quaternary
                type="error"
                size="small"
                @click="removeSkill(group.id, index)"
              >
                {{ t('editor.actions.remove') }}
              </NButton>
            </div>
          </FieldControl>
        </div>

        <NSpace size="small">
          <NButton secondary size="small" @click="addSkill(group.id)">
            {{ t('editor.actions.addSkill') }}
          </NButton>
          <NButton
            quaternary
            type="error"
            size="small"
            @click="removeGroup(group.id)"
          >
            {{ t('editor.actions.removeSkillGroup') }}
          </NButton>
        </NSpace>
      </NSpace>
    </section>

    <NButton secondary type="primary" @click="addGroup">
      {{ t('editor.actions.addSkillGroup') }}
    </NButton>
  </NSpace>
</template>
