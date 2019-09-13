const puppeteer = require('puppeteer')
const assert = require('assert')

const config = require('./lib/config')

const loadUrl = require('./lib/helpers').loadUrl
const click = require('./lib/helpers').click
const typeText = require('./lib/helpers').typeText
const waitForText = require('./lib/helpers').waitForText
const shouldExist = require('./lib/helpers').shouldExist
const selectItem = require('./lib/helpers').selectItem
const navigateTo = require('./lib/helpers').navigateTo

describe('Tests Wallet Settings Page', () => {
  let browser
  let page

  before(async function() {
    browser = await puppeteer.launch({
      headless: config.isHeadless,
      slowMo: config.slowMo,
      devtools: config.isDevTools,
      timeout: config.launchTimeout,
      ignoreHTTPSErrors: config.ignoreHTTPSErrors,
      args: ['--start-fullscreen', '--no-sandbox', '--disable-setuid-sandbox']
    })

    page = (await browser.pages())[0]
    await page.setDefaultTimeout(config.waitingTimeout)
    await page.setViewport({
      width: config.viewportWidth,
      height: config.viewportHeight
    })
  })

  after(async function() {
    await browser.close()
  })

  it('Should load page', async () => {
    await loadUrl(page, config.baseUrl)

    // Used for getting the newly opened window
    const pageTarget = page.target()

    // Get the loginPage
    await click(page, '#loginBtn')
    const loginPageTarget = await browser.waitForTarget(target => target.opener() === pageTarget)
    const loginPage = await loginPageTarget.page()

    // Login user
    await typeText(loginPage, config.testAccountName, '#identifierId')
    await click(loginPage, '#identifierNext')
    await typeText(loginPage, config.testAccountPassword, 'input[type="password"]')
    await click(loginPage, '#passwordNext')

    await waitForText(page, '.wallet-home .headline', 'My Wallet')
  })

  it('Should go to wallet settings page', async () => {
    await navigateTo(page, '#settings-link', '.wallet-settings')
  })

  it('Should change network to rinkeby', async () => {
    await click(page, '#network-panel-header')

    const textToSelect = 'Rinkeby Test Network'
    await selectItem(page, '#select-network', '.select-network-container', textToSelect)
    await page.waitFor(100)
    const networkSelected = await page.$eval('.select-network-container .v-select__selection', el => el.textContent)

    // check if textToSelect was selected
    assert.equal(textToSelect, networkSelected)
  })

  it('Should show private key popup', async () => {
    await click(page, '#privacy-panel-header')
    await click(page, '#private-key-btn')
    await shouldExist(page, '.private-key-container')
  })

  it('Should show download wallet', async () => {
    await page.waitFor(100)
    await click(page, '#show-download-form-btn')

    // wait for expansion effect
    await page.waitFor(100)
    await shouldExist(page, '.download-form-container')
    await typeText(page, 's@mplePassword', '#json-file-password')
    await click(page, `#${config.isMobile ? 'mobile-' : ''}json-file-confirm-btn`)

    // wait for download wallet to appear
    await page.waitForResponse(response => response.url().indexOf('https://api.infura.io/v1/jsonrpc/rinkeby') >= 0, { timeout: 60000 })

    await page.waitFor(100)
    await shouldExist(page, `#${config.isMobile ? 'mobile-' : ''}json-file-download-btn`)
  })

  it('Should show private-key', async () => {
    await click(page, '#show-private-key-btn')

    // wait for expansion effect
    await page.waitFor(300)
    await shouldExist(page, '#click-to-copy-btn')

    await click(page, '.private-key-container #close-btn')
  })

  // TODO: after permissions feature are done
  // it('Should show dapp permission popup', async () => {
  //   await page.waitFor(300)
  //   await click(page, '#dapp-permisson-btn')
  //   await shouldExist(page, '.dapp-permisson-container')
  //   await click(page, '.dapp-permisson-container #close-btn')
  // })

  // TODO: after actual themes are done
  // it('Should show display settings', async () => {
  //   await page.waitFor(300)
  //   await click(page, '#display-panel-header')
  //   await click(page, '#default-theme-btn')
  //   await click(page, '#cerulean-theme-btn')
  //   await click(page, '#shuttle-grey-theme-btn')
  //   await click(page, '#default-theme-btn')
  // })
})