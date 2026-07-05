import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

const materialTypes = ['avatar', 'summary', 'experience', 'skills'] as const

async function openFreshEditor(page: Page) {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
}

async function dragMaterialToCanvas(page: Page, type: string) {
  const materialTitle = page.getByTestId(`material-${type}`).locator('strong')
  await materialTitle.scrollIntoViewIfNeeded()

  const materialBox = await materialTitle.boundingBox()
  const dropPoint = await page
    .getByTestId('resume-canvas-list')
    .evaluate((element) => {
      const rect = element.getBoundingClientRect()
      return {
        x: rect.left + Math.min(80, rect.width / 2),
        y: Math.min(Math.max(rect.top + 80, 80), window.innerHeight - 80),
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

  await expect(page.getByText('AIResumeCraft')).toBeVisible()
  await expect(page.getByText('Materials')).toBeVisible()
  await expect(page.getByText('Canvas')).toBeVisible()
  await expect(page.getByTestId('material-avatar')).toBeVisible()
  await expect(page.getByTestId('resume-module')).toHaveCount(4)
})

test('drags materials into the canvas and reorders modules', async ({
  page,
}) => {
  test.setTimeout(60_000)
  await openFreshEditor(page)

  const modules = page.getByTestId('resume-module')
  await expect(modules).toHaveCount(4)

  for (const [index, type] of materialTypes.entries()) {
    await dragMaterialToCanvas(page, type)
    await expect(modules).toHaveCount(5 + index)
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

  const firstModuleHandle = modules.first().locator('.drag-handle')
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
        && ids.length === 8
        && new Set(ids).size === 8
      )
    })
    .toBe(true)

  await page.getByPlaceholder('Name').first().fill('Playwright Verified')
  await expect(page.getByPlaceholder('Name').first()).toHaveValue(
    'Playwright Verified',
  )
  await page.reload()
  await expect(page.getByPlaceholder('Name').first()).toHaveValue(
    'Playwright Verified',
  )
})
