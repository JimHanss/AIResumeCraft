import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

const materialTypes = [
  'avatar',
  'summary',
  'education',
  'experience',
  'skills',
] as const

async function openFreshEditor(page: Page) {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
}

async function dragMaterialToCanvas(page: Page, type: string) {
  const materialItem = page.getByTestId(`material-${type}`)
  await materialItem.scrollIntoViewIfNeeded()

  const materialBox = await materialItem.boundingBox()
  const dropPoint = await page
    .getByTestId('resume-canvas-list')
    .evaluate((element) => {
      const rect = element.getBoundingClientRect()
      return {
        x: rect.left + Math.min(120, rect.width / 2),
        y: Math.min(Math.max(rect.top + 28, 96), window.innerHeight - 96),
      }
    })

  expect(materialBox).not.toBeNull()

  await page.mouse.move(
    materialBox!.x + materialBox!.width / 2,
    materialBox!.y + materialBox!.height / 2,
  )
  await page.mouse.down()
  await page.mouse.move(dropPoint.x, materialBox!.y + materialBox!.height / 2, {
    steps: 10,
  })
  await page.mouse.move(dropPoint.x, dropPoint.y, { steps: 30 })
  await page.mouse.up()
}

test('loads the editor workspace', async ({ page }) => {
  await openFreshEditor(page)

  await expect(page.getByText('AIResumeCraft').first()).toBeVisible()
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
  await expect(page.getByTestId('resume-module')).toHaveCount(5)

  const appHeader = page.locator('.app-header')
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await expect
    .poll(async () => {
      const box = await appHeader.boundingBox()
      return Math.round(box?.y ?? -1)
    })
    .toBe(0)
})

test('drags materials into the canvas and reorders modules', async ({
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

  for (const [index, type] of materialTypes.entries()) {
    await dragMaterialToCanvas(page, type)
    await expect(modules).toHaveCount(6 + index)
  }

  const moduleTypes = async () =>
    modules.evaluateAll(elements =>
      elements.map(element => element.getAttribute('data-module-type')),
    )
  const moduleIds = async () =>
    modules.evaluateAll(elements =>
      elements.map(element => element.getAttribute('data-module-id')),
    )

  await expect
    .poll(async () => {
      const types = await moduleTypes()
      return materialTypes.every(
        moduleType =>
          types.filter(type => type === moduleType).length === 2,
      )
    })
    .toBe(true)

  await page.evaluate(() => window.scrollTo(0, 0))

  const firstModuleHandle = modules
    .first()
    .locator('[data-testid^="module-drag-"]')
  const targetModule = modules.nth(3)
  const beforeReorder = await moduleIds()
  const sourceBox = await firstModuleHandle.boundingBox()
  const targetBox = await targetModule.boundingBox()

  expect(sourceBox).not.toBeNull()
  expect(targetBox).not.toBeNull()

  await page.mouse.move(
    sourceBox!.x + sourceBox!.width / 2,
    sourceBox!.y + sourceBox!.height / 2,
  )
  await page.mouse.down()
  await page.mouse.move(
    sourceBox!.x + sourceBox!.width / 2,
    sourceBox!.y + sourceBox!.height / 2 + 30,
    { steps: 5 },
  )
  await page.mouse.move(
    targetBox!.x + targetBox!.width / 2,
    targetBox!.y + targetBox!.height / 2,
    { steps: 30 },
  )
  await page.mouse.move(
    targetBox!.x + targetBox!.width / 2,
    targetBox!.y + targetBox!.height - 10,
    { steps: 10 },
  )
  await page.mouse.up()

  await expect
    .poll(async () => {
      const ids = await moduleIds()
      return (
        ids.join('|') !== beforeReorder.join('|')
        && ids.length === 10
        && new Set(ids).size === 10
      )
    })
    .toBe(true)

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
