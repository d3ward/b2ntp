import { defineConfig } from 'vite'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { htmlTransformPlugin, copyStaticPlugin } from './config/vite.plugins.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const src = resolve(__dirname, 'src-web')

export default defineConfig({
  root: src,
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rolldownOptions: {
      input: {
        index: resolve(src, 'index.html'),
        themes: resolve(src, 'themes.html'),
      }
    }
  },
  server: {
    port: 3000,
    open: true
  },
  plugins: [
    htmlTransformPlugin(__dirname),
    copyStaticPlugin({
      targets: [
        { src: '../assets', dest: '' },
        { src: 'themes', dest: '' },
      ]
    })
  ]
})
