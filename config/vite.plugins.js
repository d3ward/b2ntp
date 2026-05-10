import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { marked } from 'marked'
export { viteStaticCopy as copyStaticPlugin } from 'vite-plugin-static-copy'

export function htmlTransformPlugin(rootDir) {
  return {
    name: 'html-transform',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const dir = dirname(ctx.filename)
        const processIncludes = (content) =>
          content.replace(/<!--\s*#include\s+([\w/.\-]+)\s*-->/g, (_, file) => {
            const included = readFileSync(resolve(dir, file), 'utf-8')
            return processIncludes(included)
          })
        html = processIncludes(html)
        if (html.includes('<!-- CHANGELOG -->')) {
          const md = readFileSync(resolve(rootDir, 'CHANGELOG.md'), 'utf-8')
          html = html.replace('<!-- CHANGELOG -->', marked(md))
        }
        html = html.replace('<!-- YEAR -->', new Date().getFullYear().toString())
        return html
      }
    }
  }
}
