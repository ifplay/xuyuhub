import { marked as _marked } from "marked"
import _markedForms from "marked-forms"

_marked.use(_markedForms())

const _md = (markdown, containerClasses = `p-5 prose dark:prose-dark`) => {
  let html = _marked.parse(markdown)
  if (containerClasses) {
    return `<div class="${containerClasses}">${html}</div>`
  }

  return html
}

export const marked = _marked
export const md = _md