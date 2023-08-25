import { beforeEach, afterEach, describe, it, expect } from 'vitest'
import { readFile } from './fs'
import { replace } from './replace-in-file'

const testDir = 'E:/playgournd/autopush/test'

const file = `${testDir}/config.js`
describe.only('replace is ok', () => {
  it(`replace openIsc: false -> openIsc: true`, async () => {
    const replacedFiles = await replace(file, 'openIsc: false', 'openIsc: true')
    const content = await readFile(file, 'utf-8')
    const r1 = /openIsc: false/.test(content)
    const r2 = /openIsc: true/.test(content)
    expect(r1).toBe(false)
    expect(r2).toBe(true)
    expect(replacedFiles[0].hasChanged).toBe(true)
  })
})
