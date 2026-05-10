import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src-ext/**/*.test.js', 'src-web/**/*.test.js'],
  },
})
