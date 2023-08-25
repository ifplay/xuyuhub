await import('./datetime')
import { test, expect } from 'vitest'

test('nyr()', async () => {
  const d = nyr();
  expect(d).includes('-')
})
