import { chromium } from 'playwright-core'

const base = 'http://localhost:5180/'
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))

// — Home: select an anchor via the store (clicking exact 3D pixels is flaky), then use the real UI
await page.goto(base)
await page.waitForLoadState('networkidle')
await page.waitForTimeout(2000)

// click roughly on the head dot (projected position known from previous shot)
await page.mouse.click(718, 310)
await page.waitForTimeout(1600)
await page.screenshot({ path: '/tmp/ees-test/01-anchor.png' })

const sheetVisible = await page.locator('.anchor-sheet').isVisible().catch(() => false)
console.log('anchor sheet visible after head click:', sheetVisible)

if (sheetVisible) {
  await page.click('text=Add a note here')
  await page.fill('.note-form textarea >> nth=0', 'Alpha waves during quiet focus')
  await page.click('button:has-text("EEG")')
  await page.fill('.note-form textarea >> nth=1', 'Dry-electrode EEG headbands in a mock office')
  await page.fill('.note-form textarea >> nth=2', 'To see which room layouts protect deep work')
  await page.fill('.note-form textarea >> nth=3', 'Whether alpha rebound predicts real productivity')
  await page.click('button:has-text("Place the note")')
  await page.waitForTimeout(1800)
  await page.screenshot({ path: '/tmp/ees-test/02-added.png' })
  console.log('note added, sheet shows count:', await page.locator('.anchor-sheet .note-card').count())
}

// — Notes panel + search
await page.click('button:has-text("Notes")')
await page.fill('.search', 'alpha')
await page.waitForTimeout(400)
console.log('search "alpha" results:', await page.locator('.note-list .note-card').count())
await page.screenshot({ path: '/tmp/ees-test/03-panel.png' })

// — open a note from the list
await page.click('.note-list .note-card >> nth=0')
await page.waitForTimeout(400)
console.log('modal visible:', await page.locator('.note-modal').isVisible())
await page.keyboard.press('Escape')

// — wish view
await page.fill('.search', '')
await page.click('button:has-text("Wish I knew")')
await page.waitForTimeout(1200)
await page.screenshot({ path: '/tmp/ees-test/04-wish.png' })

// — projector
await page.goto(base + '#/projector')
await page.waitForTimeout(3000)
await page.screenshot({ path: '/tmp/ees-test/05-projector.png' })
console.log('projector QR visible:', await page.locator('.projector-qr svg').isVisible())

// — submit page (mobile viewport)
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } })
await mobile.goto(base + '#/submit')
await mobile.waitForLoadState('networkidle')
await mobile.click('button.chip:has-text("Plant")')
await mobile.fill('.note-form textarea >> nth=0', 'Smell of greenery and calm')
await mobile.fill('.note-form textarea >> nth=1', 'Short interviews at the booth')
await mobile.fill('.note-form textarea >> nth=2', 'Curiosity')
await mobile.click('button:has-text("Place the note")')
await mobile.waitForTimeout(800)
console.log('submit success visible:', await mobile.locator('.submit-done').isVisible())
await mobile.screenshot({ path: '/tmp/ees-test/06-submit.png' })

// — admin
await page.goto(base + '#/admin')
await page.fill('input[type=password]', 'demo')
await page.click('button:has-text("Unlock")')
await page.waitForTimeout(600)
const rows = await page.locator('.admin-table tbody tr').count()
console.log('admin rows:', rows)
await page.locator('.admin-table tbody tr >> nth=0').locator('button:has-text("Hide")').click()
await page.waitForTimeout(600)
console.log('after hide, hidden rows:', await page.locator('.row-hidden').count())
await page.screenshot({ path: '/tmp/ees-test/07-admin.png' })

console.log('PAGE ERRORS:', errors.length ? errors.slice(0, 5) : 'none')
await browser.close()
