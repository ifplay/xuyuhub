#! /usr/bin/env node
import { describe, it, expect } from 'vitest'
import { jenv } from './env.js'
import { pathExists } from './fs.js'
import { home } from './os.js'

describe.only('jenv is ok', () => {
  const testFile = '.env.json'
  const pathNotExistFile = home('.autopush/xxx/yyy/.env.json')

  it(`jenv('password') has value after run`, async () => {
    const val = await jenv('password', { value: '1234' })
    expect(val).toBe('1234')

    const val2 = await jenv('password', '1234')
    expect(val2).toBe('1234')

    const val3 = await jenv('password2', '123456', { file: testFile })
    expect(val3).toBe('123456')

    const r2 = await pathExists(testFile)
    expect(r2).toBe(true)
  })

  it('jenv(password) success when path not exist', async () => {
    const val = await jenv('password', {
      file: pathNotExistFile,
      value: '1234',
    })
    expect(val).toBe('1234')

    const r = await pathExists(pathNotExistFile)
    expect(r).toBe(true)
  })
})
