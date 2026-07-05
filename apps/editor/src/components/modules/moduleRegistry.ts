import type { ResumeModuleType } from '@airesumecraft/shared'
import type { Component } from 'vue'
import AvatarModule from './AvatarModule.vue'
import EducationModule from './EducationModule.vue'
import ExperienceModule from './ExperienceModule.vue'
import SkillsModule from './SkillsModule.vue'
import SummaryModule from './SummaryModule.vue'

export const moduleComponents = {
  avatar: AvatarModule,
  summary: SummaryModule,
  education: EducationModule,
  experience: ExperienceModule,
  skills: SkillsModule,
} satisfies Record<ResumeModuleType, Component>

export function getModuleComponent(type: ResumeModuleType) {
  return moduleComponents[type]
}
