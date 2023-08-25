import { it, expect } from 'vitest'
await import('./marked')

it('markdown转html正确")', async () => {
  const html = await md('### hello')
  console.log(html)
  expect(html).toBe(`<div class="p-5 prose dark:prose-dark"><h3 id="hello">hello</h3>
</div>`)

  const html2 = await(md('### world', ''));
  console.log(html2)
  expect(html2).toBe('<h3 id="world">world</h3>\n')
})
