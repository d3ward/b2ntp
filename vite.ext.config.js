import { defineConfig } from 'vite'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import postcssPresetEnv from 'postcss-preset-env'
import purgecss from '@fullhuman/postcss-purgecss'
import { htmlTransformPlugin, copyStaticPlugin } from './config/vite.plugins.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const src = resolve(__dirname, 'src-ext')

export default defineConfig(({ mode }) => ({
  root: src,
  // The extension gets its own PostCSS pipeline, overriding the root
  // postcss.config.js (which stays as-is for the src-web marketing site).
  //
  //  - cascade-layers polyfill OFF. It rewrites @layer into specificity hacks
  //    and strips the at-rule, which is what forced !important overrides all
  //    through this migration. The extension is Chrome MV3, where @layer is
  //    natively supported, so the polyfill is pure cost here. With it off,
  //    Tailwind/DaisyUI stay in their layers and the unlayered bespoke Sass
  //    wins by default -- which is the cascade this codebase actually wants.
  //
  //  - PurgeCSS kept. It is not redundant even with Tailwind v4's on-demand
  //    generation: DaisyUI ships a component's whole rule set once any one of
  //    its classes is used, and purging trims the shared chunk from 91.5kB to
  //    68.6kB raw (12.7 -> 8.2kB gzip). That chunk is loaded by blank.html too,
  //    so it is the NTP's budget. Its content globs include src-ext JS, so
  //    class names written as literals in JS are seen; the one place that
  //    composed a class name at runtime (toast.js) was rewritten in ticket 10
  //    to use whole literals instead.
  css: {
    postcss: {
      plugins: [
        postcssPresetEnv({ stage: 2, features: { 'cascade-layers': false } }),
        purgecss({
          content: ['./src-ext/**/*.{html,js}'],
          defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
        })
      ]
    }
  },
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
    tailwindcss(),
    htmlTransformPlugin(__dirname),
    copyStaticPlugin({
      targets: [
        { src: '../assets', dest: '' },
        { src: 'manifest.json', dest: '' },
      ]
    })
  ]
}))
