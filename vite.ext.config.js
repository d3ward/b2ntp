import { defineConfig } from 'vite'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { htmlTransformPlugin, copyStaticPlugin } from './config/vite.plugins.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const src = resolve(__dirname, 'src-ext')

export default defineConfig(({ mode }) => ({
  root: src,
  build: {
    outDir: resolve(__dirname, 'dist-ext'),
    emptyOutDir: true,
    sourcemap: mode === 'development',
    minify: mode !== 'development',
    rolldownOptions: {
      input: {
        blank: resolve(src, 'blank.html'),
        options: resolve(src, 'options.html'),
      }
    }
  },
  define: {
    __VERSION__: JSON.stringify(process.env.npm_package_version)
  },
  plugins: [
    htmlTransformPlugin(__dirname),
    copyStaticPlugin({
      targets: [
        { src: '../assets', dest: '' },
        { src: 'manifest.json', dest: '' },
      ]
    })
  ]
}))
