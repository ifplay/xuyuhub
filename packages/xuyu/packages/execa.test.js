import { it, expect } from 'vitest'
await import('./execa')

it('explorer e:/")', async () => {
  const cmd = 'start explorer e:/'
  const a = await execa(cmd)
  console.log(a)
  expect(a).toBeTypeOf('object')
  expect(a.command).toBe(cmd)
})
