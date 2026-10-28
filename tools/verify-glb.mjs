import { chromium } from 'playwright-core'

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:5180/')
await page.waitForLoadState('networkidle')
await page.waitForTimeout(2500)

const spots = [ [700, 480, 'left chest'], [716, 350, 'head'], [700, 690, 'shin'] ]
for (const [x, y, label] of spots) {
  await page.mouse.click(x, y)
  await page.waitForTimeout(1400)
  await page.keyboard.press('Escape') // close a note modal if one opened
  const heading = await page.locator('.anchor-sheet h2').textContent().catch(() => 'none')
  console.log(`click ${label} ->`, heading)
  await page.keyboard.press('Escape')
  await page.click('button:has-text("Reset view")', { force: true })
  await page.waitForTimeout(1300)
}
await page.screenshot({ path: '/tmp/ees-test/21-glb-final.png' })
await browser.close()
