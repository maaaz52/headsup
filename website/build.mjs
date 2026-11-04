import { cpSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const output = join(root, 'dist')

rmSync(output, { recursive: true, force: true })
mkdirSync(output, { recursive: true })

for (const file of ['index.html', 'privacy.html', 'styles.css', 'script.js']) {
  cpSync(join(root, file), join(output, file))
}

cpSync(join(root, 'assets'), join(output, 'assets'), { recursive: true })
