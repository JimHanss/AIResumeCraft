<script setup lang="ts">
import type {
  AvatarResumeModule,
  CustomResumeField,
  CustomResumeModule,
  EducationResumeItem,
  EducationResumeModule,
  ExperienceResumeModule,
  ResumeModule,
  SkillGroup,
  SkillsResumeModule,
  SummaryResumeModule,
} from '@airesumecraft/shared'
import type { PdfExportQuality } from '../composables/usePdfExport'
import type {
  ResumeThemeId,
  ResumeThemePreviewFontFamily,
} from '../config/resumeThemes'
import { NButton, NButtonGroup, NSelect, useMessage } from 'naive-ui'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Draggable from 'vuedraggable'
import { useDragSelectionGuard } from '../composables/useDragSelectionGuard'
import { usePdfExport } from '../composables/usePdfExport'
import {
  useResumeValidation,
  validationMessageKey,
} from '../composables/useResumeValidation'
import { getResumeTheme, resumeThemes } from '../config/resumeThemes'
import { useResumeStore } from '../stores/resume'

const store = useResumeStore()
const { t } = useI18n()
const message = useMessage()
const { clearTextSelection, endDrag, startDrag } = useDragSelectionGuard()
const { exportError, exportPreview, isExporting } = usePdfExport()
const { validateResumeForExport } = useResumeValidation()

const previewPaperRef = ref<HTMLElement>()

const fontOptions = [
  { label: 'Microsoft YaHei', value: 'sans' },
  { label: 'Inter', value: 'inter' },
  { label: 'Georgia', value: 'serif' },
]
const fontSizeOptions = [12, 13, 14, 15, 16].map(value => ({
  label: String(value),
  value,
}))
const lineHeightOptions = [1.35, 1.5, 1.65, 1.8].map(value => ({
  label: String(Math.round(value * 16)),
  value,
}))
const exportQualityOptions = computed(
  () =>
    [
      {
        label: t('editor.export.standardQuality'),
        value: 'standard',
      },
      {
        label: t('editor.export.highQuality'),
        value: 'high',
      },
    ] satisfies Array<{ label: string, value: PdfExportQuality }>,
)
const resumeThemeOptions = computed(() =>
  resumeThemes.map(theme => ({
    label: t(theme.labelKey),
    value: theme.id,
  })),
)

const selectedResumeThemeId = computed({
  get: () => store.preferences.resumeThemeId,
  set: (value: ResumeThemeId) => store.setResumeTheme(value),
})
const selectedExportQuality = computed({
  get: () => store.preferences.exportQuality,
  set: (value: PdfExportQuality) => store.setExportQuality(value),
})
const selectedFontFamily = computed({
  get: () => store.preferences.previewFontFamily,
  set: (value: ResumeThemePreviewFontFamily) =>
    store.setPreviewFontFamily(value),
})
const selectedFontSize = computed({
  get: () => store.preferences.previewFontSize,
  set: (value: number) => store.setPreviewFontSize(value),
})
const selectedLineHeight = computed({
  get: () => store.preferences.previewLineHeight,
  set: (value: number) => store.setPreviewLineHeight(value),
})

const activeTheme = computed(() =>
  getResumeTheme(store.preferences.resumeThemeId),
)

const fontFamilyValue = computed(() => {
  if (store.preferences.previewFontFamily === 'serif')
    return 'Georgia, Times New Roman, serif'

  if (store.preferences.previewFontFamily === 'inter')
    return 'Inter, Arial, sans-serif'

  return 'Microsoft YaHei, PingFang SC, Inter, Arial, sans-serif'
})

const previewStyle = computed(() => ({
  ...activeTheme.value.cssVars,
  '--preview-accent': store.preferences.previewAccentColor,
  '--preview-font-family': fontFamilyValue.value,
  '--preview-font-size': `${store.preferences.previewFontSize}px`,
  '--preview-line-height': String(store.preferences.previewLineHeight),
}))

const avatarModule = computed(() =>
  store.previewOrderedModules.find(
    (module): module is AvatarResumeModule => module.type === 'avatar',
  ),
)

const bodyModules = computed({
  get: () =>
    store.previewOrderedModules.filter(module => module.type !== 'avatar'),
  set: (modules: ResumeModule[]) => {
    const avatarModules = store.orderedModules.filter(
      module => module.type === 'avatar',
    )
    store.reorderModules([...avatarModules, ...modules])
  },
})

function startPreviewDrag() {
  clearTextSelection()
  startDrag()
}

const profile = computed(() => {
  const avatar = avatarModule.value
  return {
    avatarUrl: avatar?.content.avatarUrl ?? '',
    email: avatar?.content.email || store.document.profile.email,
    headline: avatar?.content.headline || store.document.profile.headline,
    location: avatar?.content.location || store.document.profile.location,
    name: avatar?.content.name || store.document.profile.name,
    phone: avatar?.content.phone ?? '',
    profileUrl: avatar?.content.profileUrl ?? '',
  }
})

const initials = computed(() =>
  profile.value.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join(''),
)

const contactItems = computed(() =>
  [
    profile.value.phone,
    profile.value.email,
    profile.value.location,
    displayUrl(profile.value.profileUrl),
  ].filter(Boolean),
)

function isSummaryModule(module: ResumeModule): module is SummaryResumeModule {
  return module.type === 'summary'
}

function isEducationModule(
  module: ResumeModule,
): module is EducationResumeModule {
  return module.type === 'education'
}

function isExperienceModule(
  module: ResumeModule,
): module is ExperienceResumeModule {
  return module.type === 'experience'
}

function isSkillsModule(module: ResumeModule): module is SkillsResumeModule {
  return module.type === 'skills'
}

function isCustomModule(module: ResumeModule): module is CustomResumeModule {
  return module.type === 'custom'
}

function moduleTitle(module: ResumeModule) {
  return module.title || t(`modules.${module.type}.title`)
}

function displayUrl(url: string) {
  return url
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
}

function joinParts(parts: Array<string | undefined>) {
  return parts
    .map(part => part?.trim())
    .filter(Boolean)
    .join(' / ')
}

function dateRange(startDate?: string, endDate?: string, current?: boolean) {
  const start = startDate?.trim()
  const end = current ? t('editor.preview.present') : endDate?.trim()
  return [start, end].filter(Boolean).join(' - ')
}

function textBullets(description = '') {
  return description
    .split(/\n+/)
    .map(line => line.replace(/^\s*[-*]\s*/, '').trim())
    .filter(Boolean)
}

function educationDetails(item: EducationResumeItem) {
  return [
    item.gpa ? `${t('editor.fields.gpa')}: ${item.gpa}` : '',
    item.honors ? `${t('editor.fields.honors')}: ${item.honors}` : '',
    item.coursework
      ? `${t('editor.fields.coursework')}: ${item.coursework}`
      : '',
    ...textBullets(item.description),
  ].filter(Boolean)
}

function skillItems(group: SkillGroup) {
  return group.skills.map(skill => skill.trim()).filter(Boolean)
}

function customFields(module: CustomResumeModule) {
  return [...module.content.fields]
    .sort((left, right) => left.order - right.order)
    .filter(hasCustomFieldContent)
}

function hasCustomFieldContent(field: CustomResumeField) {
  if (field.type === 'list')
    return field.items.some(item => item.text.trim())

  return Boolean(field.value.trim())
}

function customFieldStyle(field: CustomResumeField) {
  return {
    '--custom-field-span': String(field.span),
  }
}

function customListItems(field: CustomResumeField) {
  return field.type === 'list'
    ? field.items.map(item => item.text.trim()).filter(Boolean)
    : []
}

function safePdfFileName() {
  const name = profile.value.name.trim()
  const suffix = t('editor.export.fileSuffix')
  return `${name || 'AIResumeCraft'}-${suffix}.pdf`
}

function toggleAccentColor() {
  const themeAccent
    = activeTheme.value.defaults.previewAccentColor
      ?? activeTheme.value.cssVars['--preview-accent']
  store.setPreviewAccentColor(
    store.preferences.previewAccentColor === themeAccent
      ? '#2563eb'
      : themeAccent,
  )
}

async function handleExportPdf() {
  const validation = validateResumeForExport(store.document)
  if (!validation.valid) {
    message.error(t(validationMessageKey(validation.errors[0]!.code)))
    return
  }

  const exported = await exportPreview(previewPaperRef.value, {
    fileName: safePdfFileName(),
    quality: store.preferences.exportQuality,
  })

  if (exported) {
    message.success(t('editor.export.success'))
    return
  }

  const fallbackMessage
    = exportError.value === 'missing-preview'
      ? t('editor.export.missingPreview')
      : t('editor.export.failed')
  message.error(fallbackMessage)
}
</script>

<template>
  <section class="preview-workbench" data-testid="resume-preview">
    <div class="preview-toolbar" data-testid="preview-toolbar">
      <div class="preview-toolbar-rows">
        <div
          class="preview-toolbar-row preview-toolbar-row-primary"
          data-testid="preview-toolbar-row-primary"
        >
          <NButtonGroup size="small">
            <NButton type="primary" secondary>
              {{ t('editor.preview.basicLayout') }}
            </NButton>
            <NButton secondary>
              {{ t('editor.preview.smartTypeset') }}
            </NButton>
          </NButtonGroup>
        </div>

        <div
          class="preview-toolbar-row preview-toolbar-row-layout"
          data-testid="preview-toolbar-row-layout"
        >
          <label class="preview-control" data-testid="preview-theme-control">
            <span>{{ t('editor.preview.templateStyle') }}</span>
            <NSelect
              v-model:value="selectedResumeThemeId"
              class="preview-select preview-select-wide"
              data-testid="resume-theme-select"
              size="small"
              :options="resumeThemeOptions"
            />
          </label>

          <NSelect
            v-model:value="selectedFontFamily"
            class="preview-select preview-select-wide"
            data-testid="preview-font-family-select"
            size="small"
            :options="fontOptions"
          />
          <label
            class="preview-control"
            data-testid="preview-font-size-control"
          >
            <span>{{ t('editor.preview.fontSize') }}</span>
            <NSelect
              v-model:value="selectedFontSize"
              class="preview-select"
              size="small"
              :options="fontSizeOptions"
            />
          </label>
          <label
            class="preview-control"
            data-testid="preview-line-height-control"
          >
            <span>{{ t('editor.preview.lineHeight') }}</span>
            <NSelect
              v-model:value="selectedLineHeight"
              class="preview-select"
              size="small"
              :options="lineHeightOptions"
            />
          </label>

          <button
            class="preview-color-swatch"
            type="button"
            :aria-label="t('editor.preview.color')"
            :style="{ background: store.preferences.previewAccentColor }"
            :title="t('editor.preview.color')"
            @click="toggleAccentColor"
          />
          <NButton size="small" secondary>
            {{ t('editor.preview.spacing') }}
          </NButton>
        </div>

        <div
          class="preview-toolbar-row preview-toolbar-row-export"
          data-testid="preview-toolbar-row-export"
        >
          <label class="preview-control" data-testid="export-quality-control">
            <span>{{ t('editor.export.quality') }}</span>
            <NSelect
              v-model:value="selectedExportQuality"
              class="preview-select preview-select-wide"
              data-testid="export-quality-select"
              size="small"
              :options="exportQualityOptions"
            />
          </label>
          <NButton
            data-testid="export-pdf-button"
            :loading="isExporting"
            secondary
            size="small"
            type="primary"
            @click="handleExportPdf"
          >
            {{ t('editor.export.pdf') }}
          </NButton>
        </div>
      </div>
    </div>

    <article
      ref="previewPaperRef"
      class="preview-paper"
      data-testid="preview-paper"
      :data-theme="selectedResumeThemeId"
      :style="previewStyle"
    >
      <header class="preview-resume-header">
        <div class="preview-seal" aria-hidden="true">
          AR
        </div>

        <div class="preview-profile">
          <h2>{{ profile.name }}</h2>
          <p>{{ profile.headline }}</p>
          <div class="preview-contact">
            <span v-for="item in contactItems" :key="item">{{ item }}</span>
          </div>
        </div>

        <div class="preview-avatar">
          <img
            v-if="profile.avatarUrl"
            :src="profile.avatarUrl"
            :alt="profile.name"
          >
          <span v-else>{{ initials }}</span>
        </div>
      </header>

      <Draggable
        v-model="bodyModules"
        item-key="id"
        handle=".preview-section"
        ghost-class="drag-ghost"
        :force-fallback="true"
        class="preview-body"
        data-testid="preview-module-list"
        @end="endDrag"
        @start="startPreviewDrag"
      >
        <template #item="{ element: module }">
          <section
            :key="module.id"
            class="preview-section"
            data-testid="preview-module"
            :data-module-id="module.id"
            :data-module-type="module.type"
            @pointerdown="clearTextSelection"
          >
            <div class="preview-section-heading">
              <strong>{{ moduleTitle(module) }}</strong>
              <span />
            </div>

            <p v-if="isSummaryModule(module)" class="preview-summary-text">
              {{ module.content.text }}
            </p>

            <div
              v-else-if="isEducationModule(module)"
              class="preview-education-list"
            >
              <div
                v-for="item in module.content.items"
                :key="item.id"
                class="preview-education-item"
              >
                <div class="preview-experience-meta">
                  <strong>{{
                    item.school || t('editor.fields.school')
                  }}</strong>
                  <span>{{ dateRange(item.startDate, item.endDate) }}</span>
                </div>
                <p>
                  {{ joinParts([item.degree, item.field, item.location]) }}
                </p>
                <ul v-if="educationDetails(item).length > 0">
                  <li v-for="detail in educationDetails(item)" :key="detail">
                    {{ detail }}
                  </li>
                </ul>
              </div>
            </div>

            <div
              v-else-if="isExperienceModule(module)"
              class="preview-experience-list"
            >
              <div
                v-for="item in module.content.items"
                :key="item.id"
                class="preview-experience-item"
              >
                <div class="preview-experience-meta">
                  <strong>{{
                    item.company || t('editor.preview.emptyCompany')
                  }}</strong>
                  <span>{{
                    dateRange(item.startDate, item.endDate, item.current)
                  }}</span>
                </div>
                <p>{{ joinParts([item.role, item.location]) }}</p>
                <ul v-if="textBullets(item.description).length > 0">
                  <li
                    v-for="bullet in textBullets(item.description)"
                    :key="bullet"
                  >
                    {{ bullet }}
                  </li>
                </ul>
              </div>
            </div>

            <div
              v-else-if="isSkillsModule(module)"
              class="preview-skill-groups"
            >
              <div
                v-for="group in module.content.groups"
                :key="group.id"
                class="preview-skill-group"
              >
                <strong v-if="group.name">{{ group.name }}</strong>
                <ul
                  v-if="skillItems(group).length > 0"
                  class="preview-skill-list"
                >
                  <li
                    v-for="skill in skillItems(group)"
                    :key="`${group.id}-${skill}`"
                  >
                    {{ skill }}
                  </li>
                </ul>
              </div>
            </div>

            <div v-else-if="isCustomModule(module)" class="preview-custom-grid">
              <div
                v-for="field in customFields(module)"
                :key="field.id"
                class="preview-custom-field"
                :style="customFieldStyle(field)"
              >
                <strong v-if="field.label">{{ field.label }}</strong>
                <ul v-if="field.type === 'list'" class="preview-custom-list">
                  <li
                    v-for="item in customListItems(field)"
                    :key="`${field.id}-${item}`"
                  >
                    {{ item }}
                  </li>
                </ul>
                <p v-else>
                  {{ field.value }}
                </p>
              </div>
            </div>
          </section>
        </template>
      </Draggable>
    </article>
  </section>
</template>
