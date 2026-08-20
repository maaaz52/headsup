const { app, BrowserWindow } = require('electron')
const { join } = require('path')
const { writeFileSync } = require('fs')

async function main() {
  await app.whenReady()
  const win = new BrowserWindow({
    width: 512,
    height: 512,
    show: false,
    frame: false,
    transparent: true,
    webPreferences: {
      offscreen: true
    }
  })
  await win.loadFile(join(__dirname, '../build/icon-source.html'))
  // give it a tick to paint
  await new Promise((r) => setTimeout(r, 500))
  const image = await win.webContents.capturePage()
  const png = image.toPNG()
  writeFileSync(join(__dirname, '../build/icon.png'), png)
  console.log('icon.png written')
  app.quit()
}

main().catch((err) => {
  console.error(err)
  app.exit(1)
})