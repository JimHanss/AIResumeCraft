import type { Locator, Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

async function openFreshEditor(page: Page) {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
}

function collectActionableConsoleErrors(page: Page) {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() !== 'error')
      return

    const text = message.text()
    if (/ResizeObserver loop/i.test(text))
      return

    errors.push(text)
  })
  page.on('pageerror', error => errors.push(error.message))
  return errors
}

async function selectNaiveOption(page: Page, testId: string, option: string) {
  await page.getByTestId(testId).click()
  await selectOpenNaiveOption(page, option)
}

async function selectNaiveOptionFrom(
  page: Page,
  locator: Locator,
  option: string,
) {
  await locator.click()
  await selectOpenNaiveOption(page, option)
}

async function selectOpenNaiveOption(page: Page, option: string) {
  await page
    .locator('.n-base-select-option')
    .filter({ hasText: option })
    .last()
    .click()
}

async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => {
        const viewportWidth = document.documentElement.clientWidth

        return (
          document.documentElement.scrollWidth <= viewportWidth + 1
          && document.body.scrollWidth <= viewportWidth + 1
        )
      }),
    )
    .toBe(true)
}

async function expectCustomModuleDialogContained(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => {
        const modal = document.querySelector<HTMLElement>(
          '.custom-module-builder-modal',
        )
        const actions = document.querySelector<HTMLElement>(
          '.custom-module-builder-actions',
        )

        if (!modal || !actions)
          return false

        const tolerance = 1
        const modalBox = modal.getBoundingClientRect()
        const actionBox = actions.getBoundingClientRect()
        const buttonBoxes = Array.from(
          actions.querySelectorAll<HTMLElement>('.n-button'),
          button => button.getBoundingClientRect(),
        )
        const fitsInsideModal = (box: DOMRect) =>
          box.left >= modalBox.left - tolerance
          && box.right <= modalBox.right + tolerance
          && box.top >= modalBox.top - tolerance
          && box.bottom <= modalBox.bottom + tolerance

        return (
          buttonBoxes.length === 2
          && fitsInsideModal(actionBox)
          && buttonBoxes.every(fitsInsideModal)
        )
      }),
    )
    .toBe(true)
}

async function expectKeyUiControlsContained(page: Page) {
  const overflowing = await page.evaluate(() => {
    const selectors = [
      '.app-header',
      '.header-actions',
      '.module-picker-header',
      '.module-picker-item',
      '.sidebar-score-card',
      '.canvas-panel',
      '.module-frame-header',
      '.preview-toolbar',
      '.preview-toolbar-row',
      '.preview-workbench',
      '.custom-module-builder-modal',
      '.custom-module-builder-actions',
      '.custom-builder-add-actions',
    ]
    const issues: string[] = []
    const tolerance = 1

    selectors.forEach((selector) => {
      document.querySelectorAll<HTMLElement>(selector).forEach((container) => {
        const containerBox = container.getBoundingClientRect()

        if (containerBox.width === 0 || containerBox.height === 0)
          return

        Array.from(container.children).forEach((child) => {
          const childElement = child as HTMLElement
          const childStyle = getComputedStyle(childElement)

          if (
            childStyle.display === 'none'
            || childStyle.visibility === 'hidden'
          ) {
            return
          }

          const childBox = childElement.getBoundingClientRect()

          if (childBox.width === 0 || childBox.height === 0)
            return

          if (
            childBox.left < containerBox.left - tolerance
            || childBox.right > containerBox.right + tolerance
            || childBox.top < containerBox.top - tolerance
            || childBox.bottom > containerBox.bottom + tolerance
          ) {
            issues.push(
              `${selector} contains overflowing ${childElement.tagName.toLowerCase()}`,
            )
          }
        })
      })
    })

    return issues
  })

  expect(overflowing).toEqual([])
}

async function expectModuleRemovedWithOneClick(page: Page, module: Locator) {
  const moduleId = await module.getAttribute('data-module-id')
  expect(moduleId).toBeTruthy()

  await module.getByTestId('module-remove').click()
  await expect(
    page.locator(`[data-testid="resume-module"][data-module-id="${moduleId}"]`),
  ).toHaveCount(0)
}

async function createCustomModule(page: Page, title = 'Certifications') {
  await page.getByTestId('module-add').click()
  await expect(page.getByTestId('custom-module-title-input')).toBeVisible()
  await page
    .getByTestId('custom-module-title-input')
    .locator('input')
    .fill(title)
  await page
    .getByTestId('custom-field-label-input')
    .first()
    .locator('input')
    .fill('Certificate')
  await selectNaiveOptionFrom(
    page,
    page.getByTestId('custom-field-span-select').first(),
    '半行',
  )
  await page.getByTestId('custom-module-save').click()
  await expect(
    page.locator('[data-testid="resume-module"][data-module-type="custom"]'),
  ).toBeVisible()
}

test('loads the editor workspace', async ({ page }) => {
  const consoleErrors = collectActionableConsoleErrors(page)
  await page.setViewportSize({ width: 1872, height: 1009 })
  await openFreshEditor(page)

  await expect(page.getByText('AIResumeCraft').first()).toBeVisible()
  await expect(page.getByTestId('header-score')).toContainText('评分')
  await expect(page.getByTestId('header-score')).toContainText('80')
  await expect(page.getByTestId('material-list')).toBeVisible()
  await expect(page.getByTestId('resume-canvas-list')).toBeVisible()
  await expect(page.getByTestId('preview-toolbar')).toBeVisible()
  await expect(page.getByTestId('material-avatar')).toBeVisible()
  await expect(page.getByTestId('material-avatar').locator('svg')).toBeVisible()
  await expect(page.getByTestId('material-education')).toBeVisible()
  await expect(page.getByTestId('preview-font-size-control')).toContainText(
    '字号',
  )
  await expect(page.getByTestId('preview-line-height-control')).toContainText(
    '行距',
  )
  await expect(page.getByTestId('resume-theme-select')).toBeVisible()
  await expect(page.getByTestId('export-quality-select')).toBeVisible()
  await expect(page.getByTestId('export-pdf-button')).toBeEnabled()
  await expect(page.getByTestId('undo-button')).toBeDisabled()
  await expect(page.getByTestId('redo-button')).toBeDisabled()
  await expect(page.getByTestId('undo-button').locator('svg')).toBeVisible()
  await expect(page.getByTestId('redo-button').locator('svg')).toBeVisible()
  await expect(
    page.getByTestId('module-title-edit').first().locator('svg'),
  ).toBeVisible()
  await expect(
    page.getByTestId('module-remove').first().locator('svg'),
  ).toBeVisible()
  await expect(page.locator('.module-title-drag-zone .n-tag')).toHaveCount(0)
  await expect(page.getByTestId('preview-toolbar-row-primary')).toBeVisible()
  await expect(page.getByTestId('preview-toolbar-row-layout')).toBeVisible()
  await expect(page.getByTestId('preview-toolbar-row-export')).toBeVisible()
  await expect(
    page
      .getByTestId('preview-toolbar-row-layout')
      .getByTestId('preview-theme-control'),
  ).toBeVisible()
  await expect(
    page
      .getByTestId('preview-toolbar-row-layout')
      .getByTestId('export-quality-control'),
  ).toHaveCount(0)
  await expect(
    page
      .getByTestId('preview-toolbar-row-export')
      .getByTestId('export-quality-control'),
  ).toBeVisible()
  await expect(
    page
      .getByTestId('preview-toolbar-row-export')
      .getByTestId('export-pdf-button'),
  ).toBeVisible()
  await expect(page.getByTestId('left-score-panel')).toBeVisible()
  await expect(
    page.getByTestId('left-score-panel').getByTestId('resume-score-radar'),
  ).toBeVisible()
  await expect(page.getByText('简历搭建', { exact: true })).toHaveCount(0)
  await expect(page.getByText('编辑工作台', { exact: true })).toHaveCount(0)
  await expect(page.getByText('本地草稿', { exact: true })).toHaveCount(0)
  await expect(page.locator('.toolbar-metrics')).toHaveCount(0)
  await expect(page.locator('.metric-pill')).toHaveCount(0)
  await expect(page.getByTestId('resume-module')).toHaveCount(5)
  await expect
    .poll(async () => {
      const boxes = await Promise.all([
        page.locator('.module-picker').boundingBox(),
        page.locator('.canvas-panel').boundingBox(),
        page.locator('.preview-workbench').boundingBox(),
      ])
      if (boxes.some(box => !box))
        return Number.POSITIVE_INFINITY

      const tops = boxes.map(box => Math.round(box!.y))
      return Math.max(...tops) - Math.min(...tops)
    })
    .toBeLessThanOrEqual(1)

  const appHeader = page.locator('.app-header')
  await expect
    .poll(() =>
      page
        .locator('.workspace-column-right')
        .evaluate(element => getComputedStyle(element).position),
    )
    .toBe('static')

  await page.evaluate(() => window.scrollTo(0, 180))
  await expect
    .poll(async () => {
      const headerBox = await appHeader.boundingBox()
      if (!headerBox)
        return Number.POSITIVE_INFINITY

      return Math.round(headerBox.y)
    })
    .toBe(0)

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await expect
    .poll(async () => {
      const box = await appHeader.boundingBox()
      return Math.round(box?.y ?? -1)
    })
    .toBe(0)
  await expect(page.getByTestId('header-score')).toBeVisible()

  expect(consoleErrors).toEqual([])
})

test('persists preview theme and typography controls', async ({ page }) => {
  await openFreshEditor(page)

  await selectNaiveOption(page, 'resume-theme-select', '浅蓝现代')
  await expect(page.getByTestId('preview-paper')).toHaveAttribute(
    'data-theme',
    'modern-sky',
  )

  await selectNaiveOption(page, 'preview-font-size-control', '16')
  await selectNaiveOption(page, 'preview-line-height-control', '29')

  await expect
    .poll(() =>
      page
        .getByTestId('preview-paper')
        .evaluate(element =>
          getComputedStyle(element).getPropertyValue('--preview-font-size'),
        ),
    )
    .toBe('16px')
  await expect
    .poll(() =>
      page
        .getByTestId('preview-paper')
        .evaluate(element =>
          getComputedStyle(element).getPropertyValue('--preview-line-height'),
        ),
    )
    .toBe('1.8')

  await page.reload()

  await expect(page.getByTestId('preview-paper')).toHaveAttribute(
    'data-theme',
    'modern-sky',
  )
  await expect
    .poll(() =>
      page
        .getByTestId('preview-paper')
        .evaluate(element =>
          getComputedStyle(element).getPropertyValue('--preview-font-size'),
        ),
    )
    .toBe('16px')
  await expect
    .poll(() =>
      page
        .getByTestId('preview-paper')
        .evaluate(element =>
          getComputedStyle(element).getPropertyValue('--preview-line-height'),
        ),
    )
    .toBe('1.8')
})

test('undoes and redoes profile edits across editor and preview', async ({
  page,
}) => {
  await openFreshEditor(page)

  const nameInput = page
    .getByTestId('avatar-name-input')
    .first()
    .locator('input')
  const undoButton = page.getByTestId('undo-button')
  const redoButton = page.getByTestId('redo-button')

  await nameInput.fill('Undo Verified')
  await expect(page.locator('.preview-profile h2')).toHaveText('Undo Verified')
  await expect(undoButton).toBeEnabled()

  await undoButton.click()
  await expect(page.locator('.preview-profile h2')).not.toHaveText(
    'Undo Verified',
  )
  await expect(redoButton).toBeEnabled()

  await redoButton.click()
  await expect(page.locator('.preview-profile h2')).toHaveText('Undo Verified')

  await undoButton.click()
  await nameInput.fill('New Branch')
  await expect(page.locator('.preview-profile h2')).toHaveText('New Branch')
  await expect(redoButton).toBeDisabled()
})

test('exposes export controls and keeps the score radar responsive', async ({
  page,
}) => {
  await openFreshEditor(page)

  await expect(
    page.getByTestId('left-score-panel').getByTestId('resume-score-radar'),
  ).toBeVisible()
  await selectNaiveOption(page, 'export-quality-select', '高质量')
  await expect(page.getByTestId('export-pdf-button')).toBeEnabled()

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByTestId('header-score')).toBeVisible()
  await expect(
    page.getByTestId('left-score-panel').getByTestId('resume-score-radar'),
  ).toBeVisible()
  await expect
    .poll(() => page.evaluate(() => document.body.scrollWidth <= innerWidth))
    .toBe(true)
})

test('keeps action controls inside their containers across layouts', async ({
  page,
}) => {
  const consoleErrors = collectActionableConsoleErrors(page)

  await page.setViewportSize({ width: 1083, height: 936 })
  await openFreshEditor(page)
  await page.getByTestId('module-add').click()
  await expect(page.getByTestId('custom-module-title-input')).toBeVisible()

  const customBuilderFields = page.getByTestId('custom-field')
  for (let index = 0; index < 3; index += 1) {
    const nextCount = (await customBuilderFields.count()) + 1
    await page.getByTestId('custom-add-list-field').scrollIntoViewIfNeeded()
    await page.getByTestId('custom-add-list-field').click()
    await expect.poll(() => customBuilderFields.count()).toBe(nextCount)
  }

  await page.locator('.custom-module-builder-scroll').evaluate((element) => {
    element.scrollTop = 0
  })
  await expect(page.locator('.custom-builder-live-preview')).toBeVisible()
  await expect(customBuilderFields).toHaveCount(4)

  const firstBuilderField = customBuilderFields.first()
  await expect(
    firstBuilderField.getByTestId('custom-field-label-input'),
  ).toBeVisible()
  await expect(
    firstBuilderField.getByTestId('custom-field-placeholder-input'),
  ).toBeVisible()
  await expect(
    firstBuilderField.getByTestId('custom-field-type-select'),
  ).toBeVisible()
  await expect(
    firstBuilderField.getByTestId('custom-field-span-select'),
  ).toBeVisible()
  await expect(
    firstBuilderField.getByTestId('custom-field-remove').locator('svg'),
  ).toBeVisible()

  await customBuilderFields
    .nth(1)
    .getByTestId('custom-field-label-input')
    .locator('input')
    .fill('Moved Field')

  const sourceHandle = await customBuilderFields
    .nth(1)
    .locator('.custom-builder-field-handle')
    .boundingBox()
  const targetField = await firstBuilderField.boundingBox()
  expect(sourceHandle).not.toBeNull()
  expect(targetField).not.toBeNull()

  await page.mouse.move(
    sourceHandle!.x + sourceHandle!.width / 2,
    sourceHandle!.y + sourceHandle!.height / 2,
  )
  await page.mouse.down()
  await page.mouse.move(
    targetField!.x + targetField!.width / 2,
    targetField!.y + Math.min(24, targetField!.height / 2),
    { steps: 30 },
  )
  await page.mouse.up()

  await expect
    .poll(() =>
      customBuilderFields
        .first()
        .getByTestId('custom-field-label-input')
        .locator('input')
        .inputValue(),
    )
    .toBe('Moved Field')

  await expectCustomModuleDialogContained(page)
  await expectNoHorizontalOverflow(page)
  await expectKeyUiControlsContained(page)

  await page.setViewportSize({ width: 390, height: 844 })
  await expectCustomModuleDialogContained(page)
  await expectNoHorizontalOverflow(page)
  await expectKeyUiControlsContained(page)

  expect(consoleErrors).toEqual([])
})

test('removes modules with one click in every header state', async ({
  page,
}) => {
  await openFreshEditor(page)
  await page.reload()

  const modules = page.getByTestId('resume-module')
  await expect(modules).toHaveCount(5)

  const expandedModule = modules.first()
  await expect(expandedModule.locator('.module-frame-body')).toBeVisible()
  await expandedModule.locator('input').first().focus()
  await expectModuleRemovedWithOneClick(page, expandedModule)
  await expect(modules).toHaveCount(4)

  const collapsedModule = modules.nth(1)
  await expect(collapsedModule.locator('.module-frame-body')).toHaveCount(0)
  await expectModuleRemovedWithOneClick(page, collapsedModule)
  await expect(modules).toHaveCount(3)

  await createCustomModule(page, 'Temporary Module')
  await expect(modules).toHaveCount(4)

  const addedModule = page
    .locator('[data-testid="resume-module"][data-module-type="custom"]')
    .last()
  await expect(addedModule.locator('.module-frame-body')).toBeVisible()
  await expectModuleRemovedWithOneClick(page, addedModule)
  await expect(modules).toHaveCount(3)
})

test('builds, edits, persists, and removes a custom module', async ({
  page,
}) => {
  await openFreshEditor(page)

  await page.getByTestId('module-add').click()
  await expect(page.getByTestId('custom-module-title-input')).toBeVisible()
  await page.getByTestId('custom-module-save').click()
  await expect(page.getByTestId('custom-module-title-error')).toContainText(
    '请填写模块名',
  )

  await page
    .getByTestId('custom-module-title-input')
    .locator('input')
    .fill('Certifications')
  await page
    .getByTestId('custom-field-label-input')
    .first()
    .locator('input')
    .fill('Certificate')
  await selectNaiveOptionFrom(
    page,
    page.getByTestId('custom-field-span-select').first(),
    '半行',
  )

  await page.getByTestId('custom-add-textarea-field').click()
  await page
    .getByTestId('custom-field-label-input')
    .nth(1)
    .locator('input')
    .fill('Notes')

  await page.getByTestId('custom-add-list-field').click()
  await page
    .getByTestId('custom-field-label-input')
    .nth(2)
    .locator('input')
    .fill('Highlights')
  await page
    .getByTestId('custom-builder-list-item-input')
    .first()
    .locator('input')
    .fill('Cluster operations')

  await page.getByTestId('custom-module-save').click()

  const customModule = page
    .locator('[data-testid="resume-module"][data-module-type="custom"]')
    .last()
  await expect(customModule).toBeVisible()
  await expect(customModule.locator('.module-frame-body')).toBeVisible()
  await expect(customModule.locator('.module-title-drag-zone')).toContainText(
    'Certifications',
  )

  const customPreview = page
    .locator('[data-testid="preview-module"][data-module-type="custom"]')
    .last()

  await customModule
    .getByTestId('custom-module-text-input')
    .locator('input')
    .fill('CKA')
  await expect(customPreview).toContainText('CKA')
  await page.getByTestId('undo-button').click()
  await expect(customPreview).not.toContainText('CKA')
  await page.getByTestId('redo-button').click()
  await expect(customPreview).toContainText('CKA')

  await customModule
    .getByTestId('custom-module-textarea-input')
    .locator('textarea')
    .fill('Issued by CNCF')
  await customModule.getByTestId('custom-module-add-list-item').click()
  await customModule
    .getByTestId('custom-module-list-item-input')
    .nth(1)
    .locator('input')
    .fill('Security basics')

  await expect(customPreview).toContainText('Certifications')
  await expect(customPreview).toContainText('CKA')
  await expect(customPreview).toContainText('Issued by CNCF')
  await expect(customPreview).toContainText('Cluster operations')
  await expect(customPreview).toContainText('Security basics')
  await expect
    .poll(() =>
      customPreview
        .locator('.preview-custom-field')
        .first()
        .evaluate(element =>
          getComputedStyle(element).getPropertyValue('--custom-field-span'),
        ),
    )
    .toBe('6')

  await page.reload()
  const restoredPreview = page
    .locator('[data-testid="preview-module"][data-module-type="custom"]')
    .last()
  await expect(restoredPreview).toContainText('Certifications')
  await expect(restoredPreview).toContainText('CKA')
  await expect(restoredPreview).toContainText('Security basics')

  const restoredModule = page
    .locator('[data-testid="resume-module"][data-module-type="custom"]')
    .last()
  await expectModuleRemovedWithOneClick(page, restoredModule)
  await expect(
    page.locator('[data-testid="preview-module"][data-module-type="custom"]'),
  ).toHaveCount(0)
})

test('keeps custom modules in sync during canvas and preview reorder', async ({
  page,
}) => {
  await openFreshEditor(page)
  await createCustomModule(page, 'Sortable Custom')

  const previewModules = page.getByTestId('preview-module')
  const previewIds = async () =>
    previewModules.evaluateAll(elements =>
      elements.map(element => element.getAttribute('data-module-id')),
    )
  const canvasBodyIds = async () =>
    page
      .getByTestId('resume-module')
      .evaluateAll(elements =>
        elements
          .filter(
            element => element.getAttribute('data-module-type') !== 'avatar',
          )
          .map(element => element.getAttribute('data-module-id')),
      )

  const customModule = page
    .locator('[data-testid="resume-module"][data-module-type="custom"]')
    .last()
  const customModuleId = await customModule.getAttribute('data-module-id')
  expect(customModuleId).toBeTruthy()

  await customModule
    .getByTestId('custom-module-text-input')
    .locator('input')
    .fill('Sortable value')
  await expect(
    page.locator(
      `[data-testid="preview-module"][data-module-id="${customModuleId}"]`,
    ),
  ).toContainText('Sortable value')

  await customModule
    .locator('.module-frame-header')
    .click({ position: { x: 40, y: 26 } })
  await expect(customModule.locator('.module-frame-body')).toHaveCount(0)

  const sourceCanvasModule = page
    .locator('[data-testid="resume-module"][data-module-type="skills"]')
    .first()
  const sourceCanvasModuleId
    = await sourceCanvasModule.getAttribute('data-module-id')
  expect(sourceCanvasModuleId).toBeTruthy()

  await customModule.scrollIntoViewIfNeeded()
  await sourceCanvasModule.scrollIntoViewIfNeeded()

  const beforeCanvasDrag = await canvasBodyIds()
  const sourceHeader = await sourceCanvasModule
    .locator('.module-frame-header')
    .boundingBox()
  const targetHeader = await customModule
    .locator('.module-frame-header')
    .boundingBox()

  expect(sourceHeader).not.toBeNull()
  expect(targetHeader).not.toBeNull()

  await page.mouse.move(
    sourceHeader!.x + sourceHeader!.width / 2,
    sourceHeader!.y + sourceHeader!.height / 2,
  )
  await page.mouse.down()
  await page.mouse.move(
    targetHeader!.x + targetHeader!.width / 2,
    targetHeader!.y + targetHeader!.height / 2,
    { steps: 30 },
  )
  await page.mouse.up()

  await expect
    .poll(async () => {
      const nextPreviewIds = await previewIds()
      const nextCanvasBodyIds = await canvasBodyIds()
      return (
        nextCanvasBodyIds.join('|') !== beforeCanvasDrag.join('|')
        && nextPreviewIds.join('|') === nextCanvasBodyIds.join('|')
        && nextCanvasBodyIds.includes(customModuleId)
        && nextCanvasBodyIds.includes(sourceCanvasModuleId)
      )
    })
    .toBe(true)

  const beforePreviewDrag = await previewIds()
  const nonCustomPreviewModules = page.locator(
    '[data-testid="preview-module"]:not([data-module-type="custom"])',
  )
  const sourcePreview = nonCustomPreviewModules.first()
  const targetPreview = nonCustomPreviewModules.nth(1)
  const sourcePreviewModuleId
    = await sourcePreview.getAttribute('data-module-id')
  expect(sourcePreviewModuleId).toBeTruthy()
  await sourcePreview.scrollIntoViewIfNeeded()
  await targetPreview.scrollIntoViewIfNeeded()

  const sourcePreviewBox = await sourcePreview.boundingBox()
  const targetPreviewBox = await targetPreview.boundingBox()

  expect(sourcePreviewBox).not.toBeNull()
  expect(targetPreviewBox).not.toBeNull()

  await page.mouse.move(
    sourcePreviewBox!.x + sourcePreviewBox!.width / 2,
    sourcePreviewBox!.y + Math.min(36, sourcePreviewBox!.height / 2),
  )
  await page.mouse.down()
  await page.mouse.move(
    targetPreviewBox!.x + targetPreviewBox!.width / 2,
    targetPreviewBox!.y + Math.min(36, targetPreviewBox!.height / 2),
    { steps: 30 },
  )
  await page.mouse.up()

  await expect
    .poll(async () => {
      const nextPreviewIds = await previewIds()
      const nextCanvasBodyIds = await canvasBodyIds()
      return (
        nextPreviewIds.join('|') !== beforePreviewDrag.join('|')
        && nextPreviewIds.join('|') === nextCanvasBodyIds.join('|')
        && nextPreviewIds.includes(customModuleId)
        && nextPreviewIds.includes(sourcePreviewModuleId)
      )
    })
    .toBe(true)
})

test('edits existing canvas modules and restores local draft', async ({
  page,
}) => {
  test.setTimeout(60_000)
  await openFreshEditor(page)

  const modules = page.getByTestId('resume-module')
  await expect(modules).toHaveCount(5)

  await expect(modules.first().locator('.module-frame-body')).toBeVisible()
  await expect(modules.nth(1).locator('.module-frame-body')).toHaveCount(0)
  await modules
    .nth(1)
    .locator('.module-frame-header')
    .click({
      position: { x: 80, y: 26 },
    })
  await expect(modules.first().locator('.module-frame-body')).toBeVisible()
  await expect(modules.nth(1).locator('.module-frame-body')).toBeVisible()
  await modules
    .nth(1)
    .locator('.module-frame-header')
    .click({
      position: { x: 80, y: 26 },
    })
  await expect(modules.nth(1).locator('.module-frame-body')).toHaveCount(0)

  const summaryModule = page
    .locator('[data-testid="resume-module"][data-module-type="summary"]')
    .first()
  await expect(
    summaryModule.getByTestId('module-title-edit').locator('svg'),
  ).toBeVisible()
  await expect(
    summaryModule.getByTestId('module-remove').locator('svg'),
  ).toBeVisible()
  await summaryModule.getByTestId('module-title-edit').click()
  const moduleTitleInput = page
    .getByTestId('module-title-input')
    .locator('input')
  await moduleTitleInput.fill('Role Snapshot')
  await page.getByTestId('module-title-save').click()
  await expect(page.getByTestId('module-title-input')).toHaveCount(0)
  await expect(
    summaryModule.locator('.module-title-drag-zone strong'),
  ).toHaveText('Role Snapshot')
  await expect(
    page.locator(
      '[data-testid="preview-module"][data-module-type="summary"] .preview-section-heading strong',
    ),
  ).toHaveText('Role Snapshot')

  await page.locator('[data-module-type="avatar"]').first().click()
  const avatarNameInput = page
    .getByTestId('avatar-name-input')
    .first()
    .locator('input')
  await avatarNameInput.fill('Playwright Verified')
  await expect(avatarNameInput).toHaveValue('Playwright Verified')

  await page.locator('[data-module-type="education"]').first().click()
  const schoolInput = page
    .getByTestId('education-school-input')
    .first()
    .locator('input')
  await schoolInput.fill('Playwright University')
  await expect(schoolInput).toHaveValue('Playwright University')

  await page.locator('[data-module-type="skills"]').first().click()
  const skillGroupInput = page
    .getByTestId('skill-group-name-input')
    .first()
    .locator('input')
  await skillGroupInput.fill('Automation')
  await expect(skillGroupInput).toHaveValue('Automation')

  const skillItemInput = page
    .getByTestId('skill-item-input')
    .first()
    .locator('input')
  await skillItemInput.fill('Playwright')
  await expect(skillItemInput).toHaveValue('Playwright')

  await page.reload()
  await expect(
    page
      .locator(
        '[data-testid="resume-module"][data-module-type="summary"] .module-title-drag-zone strong',
      )
      .filter({ hasText: 'Role Snapshot' }),
  ).toHaveCount(1)
  await expect(
    page.getByTestId('resume-module').first().locator('.module-frame-body'),
  ).toBeVisible()
  await expect(
    page.getByTestId('resume-module').nth(1).locator('.module-frame-body'),
  ).toHaveCount(0)
  await page.locator('[data-module-type="avatar"]').first().click()
  await expect(
    page.getByTestId('avatar-name-input').first().locator('input'),
  ).toHaveValue('Playwright Verified')
  await page.locator('[data-module-type="education"]').first().click()
  await expect(
    page.getByTestId('education-school-input').first().locator('input'),
  ).toHaveValue('Playwright University')
  await page.locator('[data-module-type="skills"]').first().click()
  await expect(
    page.getByTestId('skill-group-name-input').first().locator('input'),
  ).toHaveValue('Automation')
  await expect(
    page.getByTestId('skill-item-input').first().locator('input'),
  ).toHaveValue('Playwright')
})

test('reorders body modules from the resume preview', async ({ page }) => {
  await openFreshEditor(page)

  const previewModules = page.getByTestId('preview-module')
  await expect(previewModules).toHaveCount(4)

  const previewIds = async () =>
    previewModules.evaluateAll(elements =>
      elements.map(element => element.getAttribute('data-module-id')),
    )
  const canvasBodyIds = async () =>
    page
      .getByTestId('resume-module')
      .evaluateAll(elements =>
        elements
          .filter(
            element => element.getAttribute('data-module-type') !== 'avatar',
          )
          .map(element => element.getAttribute('data-module-id')),
      )

  const beforeReorder = await previewIds()
  const sourceModule = previewModules.first()
  const targetModule = previewModules.nth(1)

  await sourceModule.scrollIntoViewIfNeeded()
  await targetModule.scrollIntoViewIfNeeded()

  const sourceBox = await sourceModule.boundingBox()
  const targetBox = await targetModule.boundingBox()

  expect(sourceBox).not.toBeNull()
  expect(targetBox).not.toBeNull()

  await page.mouse.move(
    sourceBox!.x + sourceBox!.width / 2,
    sourceBox!.y + Math.min(36, sourceBox!.height / 2),
  )
  await page.mouse.down()
  await page.mouse.move(
    targetBox!.x + targetBox!.width / 2,
    targetBox!.y + Math.min(36, targetBox!.height / 2),
    { steps: 25 },
  )
  await page.mouse.up()

  await expect
    .poll(async () => {
      const nextPreviewIds = await previewIds()
      const nextCanvasBodyIds = await canvasBodyIds()
      return (
        nextPreviewIds.join('|') !== beforeReorder.join('|')
        && nextPreviewIds.join('|') === nextCanvasBodyIds.join('|')
      )
    })
    .toBe(true)
})

test('updates the resume preview while canvas modules are being dragged', async ({
  page,
}) => {
  await openFreshEditor(page)

  const previewModules = page.getByTestId('preview-module')
  const previewIds = async () =>
    previewModules.evaluateAll(elements =>
      elements.map(element => element.getAttribute('data-module-id')),
    )
  const canvasBodyIds = async () =>
    page
      .getByTestId('resume-module')
      .evaluateAll(elements =>
        elements
          .filter(
            element => element.getAttribute('data-module-type') !== 'avatar',
          )
          .map(element => element.getAttribute('data-module-id')),
      )

  const beforePreviewIds = await previewIds()
  const sourceModule = page
    .locator('[data-testid="resume-module"][data-module-type="summary"]')
    .first()
  const targetModule = page
    .locator('[data-testid="resume-module"][data-module-type="skills"]')
    .first()

  await sourceModule.scrollIntoViewIfNeeded()
  await targetModule.scrollIntoViewIfNeeded()

  const sourceBox = await sourceModule
    .locator('.module-frame-header')
    .boundingBox()
  const targetBox = await targetModule
    .locator('.module-frame-header')
    .boundingBox()

  expect(sourceBox).not.toBeNull()
  expect(targetBox).not.toBeNull()

  await page.mouse.move(
    sourceBox!.x + sourceBox!.width / 2,
    sourceBox!.y + sourceBox!.height / 2,
  )
  await page.mouse.down()
  await page.mouse.move(
    targetBox!.x + targetBox!.width / 2,
    targetBox!.y + targetBox!.height / 2,
    { steps: 30 },
  )

  await expect
    .poll(async () => (await previewIds()).join('|'))
    .not
    .toBe(beforePreviewIds.join('|'))

  await page.mouse.up()

  await expect
    .poll(async () => {
      const nextPreviewIds = await previewIds()
      const nextCanvasBodyIds = await canvasBodyIds()
      return nextPreviewIds.join('|') === nextCanvasBodyIds.join('|')
    })
    .toBe(true)
})
