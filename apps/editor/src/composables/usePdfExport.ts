import type { Ref } from 'vue'
import html2canvas from 'html2canvas'
import { jsPDF as JsPdf } from 'jspdf'
import { readonly, ref } from 'vue'

export type PdfExportQuality = 'standard' | 'high'

export interface PdfExportOptions {
  fileName: string
  quality: PdfExportQuality
}

export type PdfExportErrorCode
  = 'export-failed' | 'missing-preview' | 'unsupported-environment'

interface PdfQualityConfig {
  imageQuality: number
  scale: number
}

const a4PageWidthMm = 210
const a4PageHeightMm = 297

const qualityConfigMap: Record<PdfExportQuality, PdfQualityConfig> = {
  high: {
    imageQuality: 0.94,
    scale: 2.5,
  },
  standard: {
    imageQuality: 0.86,
    scale: 1.5,
  },
}

function sanitizeFileName(fileName: string) {
  const normalized = fileName.trim().replace(/[<>:"/\\|?*]/g, '-')
  return normalized || 'resume.pdf'
}

function createPageCanvas(width: number, height: number) {
  const pageCanvas = document.createElement('canvas')
  pageCanvas.width = width
  pageCanvas.height = height
  return pageCanvas
}

function addCanvasPagesToPdf(
  pdf: InstanceType<typeof JsPdf>,
  canvas: HTMLCanvasElement,
  imageQuality: number,
) {
  if (canvas.width <= 0 || canvas.height <= 0)
    throw new Error('Canvas is empty.')

  const pageCanvasHeight = Math.max(
    1,
    Math.floor(canvas.width * (a4PageHeightMm / a4PageWidthMm)),
  )
  let renderedHeight = 0
  let pageIndex = 0

  while (renderedHeight < canvas.height) {
    const sliceHeight = Math.min(
      pageCanvasHeight,
      canvas.height - renderedHeight,
    )
    const pageCanvas = createPageCanvas(canvas.width, sliceHeight)
    const context = pageCanvas.getContext('2d')
    if (!context)
      throw new Error('Canvas 2D context is not available.')

    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
    context.drawImage(
      canvas,
      0,
      renderedHeight,
      canvas.width,
      sliceHeight,
      0,
      0,
      canvas.width,
      sliceHeight,
    )

    if (pageIndex > 0)
      pdf.addPage()

    const imageHeightMm = sliceHeight * (a4PageWidthMm / canvas.width)
    pdf.addImage(
      pageCanvas.toDataURL('image/jpeg', imageQuality),
      'JPEG',
      0,
      0,
      a4PageWidthMm,
      imageHeightMm,
    )

    renderedHeight += sliceHeight
    pageIndex += 1
  }
}

export function usePdfExport(): {
  exportError: Readonly<Ref<PdfExportErrorCode | undefined>>
  exportPreview: (
    element: HTMLElement | undefined,
    options: PdfExportOptions,
  ) => Promise<boolean>
  isExporting: Readonly<Ref<boolean>>
} {
  const isExporting = ref(false)
  const exportError = ref<PdfExportErrorCode>()

  async function exportPreview(
    element: HTMLElement | undefined,
    options: PdfExportOptions,
  ) {
    if (!element) {
      exportError.value = 'missing-preview'
      return false
    }

    if (typeof document === 'undefined') {
      exportError.value = 'unsupported-environment'
      return false
    }

    const qualityConfig = qualityConfigMap[options.quality]
    isExporting.value = true
    exportError.value = undefined
    element.classList.add('is-exporting')

    try {
      const canvas = await html2canvas(element, {
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        scale: qualityConfig.scale,
        useCORS: true,
      })
      const pdf = new JsPdf({
        format: 'a4',
        orientation: 'portrait',
        unit: 'mm',
      })

      addCanvasPagesToPdf(pdf, canvas, qualityConfig.imageQuality)
      pdf.save(sanitizeFileName(options.fileName))
      return true
    }
    catch {
      exportError.value = 'export-failed'
      return false
    }
    finally {
      element.classList.remove('is-exporting')
      isExporting.value = false
    }
  }

  return {
    exportError: readonly(exportError),
    exportPreview,
    isExporting: readonly(isExporting),
  }
}
