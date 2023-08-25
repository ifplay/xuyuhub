

import { it, expect } from 'vitest'
await import('./handlebars')

it('模板编译正确")', async () => {
  const template = compile("Name: {{name}}");
  const a = template({ name: "Nils" })
  expect(a).toBe('Name: Nils')
})
