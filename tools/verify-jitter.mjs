import { chromium } from 'playwright-core'

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
await page.goto('http://localhost:5180/')
await page.waitForLoadState('networkidle')
await page.waitForTimeout(2200)

for (const anchor of ['walls', 'lamp']) {
  await page.click('button:has-text("Notes")')
  await page.selectOption('.filters select >> nth=0', anchor)
  await page.click('.note-list .note-card >> nth=0')
  await page.keyboard.press('Escape')
  await page.click('button:has-text("Notes")')
  await page.waitForTimeout(4000)
  const a = await page.screenshot()
  await page.waitForTimeout(1200)
  const b = await page.screenshot()
  console.log(`${anchor} view stable (want true):`, a.equals(b))
  if (anchor === 'walls') await page.screenshot({ path: '/tmp/ees-test/10-walls.png' })
  await page.click('button:has-text("Reset view")')
  await page.waitForTimeout(1500)
}
await browser.close()
