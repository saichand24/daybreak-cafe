import { defineConfig } from 'vite'
import { realpathSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  root: realpathSync(fileURLToPath(new URL('.', import.meta.url))),
  base: './'
})
