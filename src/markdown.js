import MarkdownIt from 'markdown-it'
const RENDERER = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
});
RENDERER.use(require('markdown-it-attrs'))
RENDERER.use(require('@toycode/markdown-it-class'), { blockquote: 'blockquote' })
export default RENDERER
