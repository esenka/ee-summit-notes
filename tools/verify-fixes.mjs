import { chromium } from 'playwright-core'

const base = 'http://localhost:5180/'
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(base)
await page.waitForLoadState('networkidle')
await page.waitForTimeout(2200)

// 1. Drag on the figure must NOT select an anchor
await page.mouse.move(720, 450)
await page.mouse.down()
await page.mouse.move(900, 500, { steps: 12 })
await page.mouse.up()
await page.waitForTimeout(800)
console.log('sheet opened by drag (want false):', await page.locator('.anchor-sheet').isVisible())

// 2. Walls focus: click the walls dot via filter list, then check for jitter
await page.click('button:has-text("Reset view")')
await page.waitForTimeout(1500)
await page.click('button:has-text("Notes")')
await page.selectOption('.filters select >> nth=0', 'walls')
await page.click('.note-list .note-card >> nth=0')
await page.keyboard.press('Escape') // close modal, camera keeps flying
await page.click('button:has-text("Notes")') // close panel
await page.waitForTimeout(3500) // let the fly-to settle
const a = await page.screenshot()
await page.waitForTimeout(1000)
const b = await page.screenshot()
console.log('walls view stable (want true):', a.equals(b))
await page.screenshot({ path: '/tmp/ees-test/10-walls.png' })

// 3. New styling screenshots
await page.click('button:has-text("Reset view")')
await page.waitForTimeout(1800)
await page.screenshot({ path: '/tmp/ees-test/11-home-restyle.png' })

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } })
await mobile.goto(base + '#/submit')
await mobile.waitForLoadState('networkidle')
await mobile.screenshot({ path: '/tmp/ees-test/12-submit-restyle.png' })

const fonts = await page.evaluate(() => getComputedStyle(document.body).fontFamily)
console.log('body font:', fonts)
await browser.close()
