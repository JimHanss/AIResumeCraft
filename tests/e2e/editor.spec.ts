import { expect, test } from '@playwright/test'

test('loads the editor workspace', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByText('AIResumeCraft')).toBeVisible()
  await expect(page.getByText('模块')).toBeVisible()
  await expect(page.getByText('AI 优化')).toBeVisible()
})
