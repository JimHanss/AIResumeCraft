import type { Pinia } from 'pinia'
import { createCustomField } from '@airesumecraft/shared'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick } from 'vue'
import { i18n } from '../../i18n'
import { useResumeStore } from '../../stores/resume'
import ResumePreview from '../ResumePreview.vue'

const messageApi = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
}))

const html2canvasMock = vi.hoisted(() => vi.fn())
const pdfAddImageMock = vi.hoisted(() => vi.fn())
const pdfAddPageMock = vi.hoisted(() => vi.fn())
const pdfSaveMock = vi.hoisted(() => vi.fn())

vi.mock('html2canvas', () => ({
  default: html2canvasMock,
}))

vi.mock('jspdf', () => ({
  jsPDF: class MockJsPdf {
    addImage(...args: unknown[]) {
      pdfAddImageMock(...args)
    }

    addPage(...args: unknown[]) {
      pdfAddPageMock(...args)
    }

    save(...args: unknown[]) {
      pdfSaveMock(...args)
    }
  },
}))

vi.mock('naive-ui', async () => {
  const { defineComponent, h } = await import('vue')

  const NButton = defineComponent({
    props: {
      disabled: Boolean,
      loading: Boolean,
    },
    emits: ['click'],
    setup(props, { attrs, emit, slots }) {
      return () =>
        h(
          'button',
          {
            ...attrs,
            disabled: props.disabled || props.loading,
            type: 'button',
            onClick: (event: MouseEvent) => emit('click', event),
          },
          slots.default?.(),
        )
    },
  })

  const NSelect = defineComponent({
    props: {
      options: {
        default: () => [],
        type: Array,
      },
      value: [String, Number],
    },
    emits: ['update:value'],
    setup(props, { attrs, emit }) {
      return () =>
        h(
          'select',
          {
            ...attrs,
            value: props.value,
            onChange: (event: Event) => {
              const target = event.target as HTMLSelectElement
              const option = (props.options as Array<{ value: unknown }>).find(
                item => String(item.value) === target.value,
              )
              emit('update:value', option?.value ?? target.value)
            },
          },
          (props.options as Array<{ label: string, value: unknown }>).map(
            option =>
              h('option', { value: String(option.value) }, option.label),
          ),
        )
    },
  })

  const Wrapper = defineComponent({
    setup(_, { attrs, slots }) {
      return () => h('div', attrs, slots.default?.())
    },
  })

  return {
    NButton,
    NButtonGroup: Wrapper,
    NSelect,
    NSpace: Wrapper,
    useMessage: () => messageApi,
  }
})

vi.mock('vuedraggable', async () => {
  const { defineComponent, h } = await import('vue')

  return {
    default: defineComponent({
      props: {
        modelValue: {
          default: () => [],
          type: Array,
        },
      },
      emits: ['update:modelValue'],
      setup(props, { attrs, emit, slots }) {
        return () =>
          h('div', attrs, [
            h(
              'button',
              {
                'data-testid': 'preview-reorder-trigger',
                'onClick': () =>
                  emit(
                    'update:modelValue',
                    [...(props.modelValue as unknown[])].reverse(),
                  ),
                'type': 'button',
              },
              'reorder',
            ),
            ...(props.modelValue as unknown[]).map(element =>
              slots.item?.({ element }),
            ),
          ])
      },
    }),
  }
})

function createExportCanvas() {
  const canvas = document.createElement('canvas')
  canvas.width = 900
  canvas.height = 1200
  return canvas
}

function installTestingPinia() {
  const pinia = createPinia()
  createApp({}).use(pinia)
  setActivePinia(pinia)
  return pinia
}

function mountPreview(pinia: Pinia) {
  return mount(ResumePreview, {
    global: {
      plugins: [pinia, i18n],
    },
  })
}

describe('resume preview', () => {
  beforeEach(() => {
    localStorage.clear()
    messageApi.error.mockClear()
    messageApi.success.mockClear()
    html2canvasMock.mockReset()
    pdfAddImageMock.mockClear()
    pdfAddPageMock.mockClear()
    pdfSaveMock.mockClear()
    html2canvasMock.mockResolvedValue(createExportCanvas())
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
      () => {
        return {
          drawImage: vi.fn(),
          fillRect: vi.fn(),
          fillStyle: '',
        } as unknown as CanvasRenderingContext2D
      },
    )
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(
      'data:image/jpeg;base64,test',
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('updates theme and export quality preferences from toolbar controls', async () => {
    const pinia = installTestingPinia()
    const store = useResumeStore()
    const wrapper = mountPreview(pinia)

    await wrapper
      .get('[data-testid="resume-theme-select"]')
      .setValue('modern-sky')
    await wrapper.get('[data-testid="export-quality-select"]').setValue('high')

    expect(store.preferences.resumeThemeId).toBe('modern-sky')
    expect(store.preferences.exportQuality).toBe('high')
  })

  it('triggers PDF export and reports success', async () => {
    const pinia = installTestingPinia()
    const wrapper = mountPreview(pinia)

    await wrapper.get('[data-testid="export-pdf-button"]').trigger('click')
    await flushPromises()

    expect(html2canvasMock).toHaveBeenCalled()
    expect(pdfAddImageMock).toHaveBeenCalled()
    expect(pdfSaveMock).toHaveBeenCalled()
    expect(messageApi.success).toHaveBeenCalledWith('PDF 已导出。')
  })

  it('disables the export button while PDF export is running', async () => {
    let resolveExport!: (value: HTMLCanvasElement) => void
    html2canvasMock.mockReturnValue(
      new Promise<HTMLCanvasElement>((resolve) => {
        resolveExport = resolve
      }),
    )
    const pinia = installTestingPinia()
    const wrapper = mountPreview(pinia)

    await wrapper.get('[data-testid="export-pdf-button"]').trigger('click')
    await nextTick()

    expect(
      wrapper.get('[data-testid="export-pdf-button"]').attributes('disabled'),
    ).toBeDefined()

    resolveExport(createExportCanvas())
    await flushPromises()
  })

  it('shows localized validation errors before exporting invalid profile data', async () => {
    const pinia = installTestingPinia()
    const store = useResumeStore()
    const wrapper = mountPreview(pinia)

    store.document.profile.name = ''
    await wrapper.get('[data-testid="export-pdf-button"]').trigger('click')
    expect(html2canvasMock).not.toHaveBeenCalled()
    expect(messageApi.error).toHaveBeenCalledWith('请先填写姓名。')

    messageApi.error.mockClear()
    store.document.profile.name = 'Lin Yinuo'
    store.document.profile.email = 'invalid-email'
    await wrapper.get('[data-testid="export-pdf-button"]').trigger('click')
    expect(html2canvasMock).not.toHaveBeenCalled()
    expect(messageApi.error).toHaveBeenCalledWith('邮箱格式不正确。')
  })

  it('syncs preview body reorder back to the resume store', async () => {
    const pinia = installTestingPinia()
    const store = useResumeStore()
    const wrapper = mountPreview(pinia)
    const beforeBodyIds = store.orderedModules
      .filter(module => module.type !== 'avatar')
      .map(module => module.id)

    await wrapper
      .get('[data-testid="preview-reorder-trigger"]')
      .trigger('click')

    expect(
      store.orderedModules
        .filter(module => module.type !== 'avatar')
        .map(module => module.id),
    ).toEqual([...beforeBodyIds].reverse())
  })

  it('renders custom module fields and lists', () => {
    const pinia = installTestingPinia()
    const store = useResumeStore()

    store.addCustomModule({
      title: 'Certificates',
      content: {
        fields: [
          createCustomField('text', {
            label: 'Certificate',
            value: 'Certified Kubernetes Administrator',
          }),
          createCustomField('textarea', {
            label: 'Notes',
            value: 'Issued by CNCF\nValid through 2027',
          }),
          createCustomField('list', {
            label: 'Highlights',
            items: [
              { id: 'custom-list-a', text: 'Cluster operations' },
              { id: 'custom-list-b', text: 'Security basics' },
            ],
          }),
          createCustomField('text', {
            label: 'Empty field',
            value: '',
          }),
        ],
      },
    })

    const wrapper = mountPreview(pinia)

    expect(wrapper.text()).toContain('Certificates')
    expect(wrapper.text()).toContain('Certificate')
    expect(wrapper.text()).toContain('Certified Kubernetes Administrator')
    expect(wrapper.text()).toContain('Notes')
    expect(wrapper.text()).toContain('Issued by CNCF')
    expect(wrapper.text()).toContain('Highlights')
    expect(wrapper.text()).toContain('Cluster operations')
    expect(wrapper.text()).not.toContain('Empty field')
  })
})
