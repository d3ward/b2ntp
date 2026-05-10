import postcssPresetEnv from 'postcss-preset-env'
import purgecss from '@fullhuman/postcss-purgecss'

export default {
  plugins: [
    postcssPresetEnv({ stage: 2 }),
    purgecss({
      content: ['./src-web/**/*.{html,js}', './src-ext/**/*.{html,js}'],
      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
    })
  ]
}
