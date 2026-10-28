import { chromium } from 'playwright-core'

const url = process.argv[2] ?? 'http://localhost:5180/'
const out = process.argv[3] ?? '/tmp/ees-test/home.png'
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
page.on('pageerror', (e) => errors.push(String(e)))
await page.goto(url)
await page.waitForLoadState('networkidle')
await page.waitForTimeout(2500)
await page.screenshot({ path: out })
console.log('ERRORS:', errors.length ? errors.slice(0, 10) : 'none')
await browser.close()
