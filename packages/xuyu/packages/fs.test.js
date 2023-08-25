#! /usr/bin/env node
import { beforeEach, afterEach, describe, it, expect } from 'vitest'
import { ensureFile, fileURLToPath, outputJson, pathExists, writeJson } from './fs.js'
import { home } from './os.js'
import { dirname, isAbsolute } from './path.js'
import { rm } from './trash.js'

describe('ensureFile is ok', () => {
  const testFile = home('hello.js')
  const pathNotExistFile = home('xxxx/hello.js')
  beforeEach(async () => {
    await rm(testFile)
    await rm(dirname(pathNotExistFile))
  })

  it('ensureFile success when path exist, file not exist', async () => {
    await ensureFile(testFile)
    const r = await pathExists(testFile)
    expect(r).toBe(true)
  })

  it('ensureFile success when path not exist', async () => {
    await ensureFile(pathNotExistFile)
    const r = await pathExists(pathNotExistFile)
    expect(r).toBe(true)
  })
})

describe('writeJson/outputJson is ok', () => {
  const testFile = home('hello.json')
  const pathNotExistFile = home('xxxx/hello.json')
  beforeEach(async () => {
    await rm(testFile)
    await rm(dirname(pathNotExistFile))
  })

  it('writeJson success when path exist, file not exist', async () => {
    await writeJson(testFile, {})
    const r = await pathExists(testFile)
    expect(r).toBe(true)
  })

  it('writeJson throw error when path not exist', async () => {
    const p = writeJson(pathNotExistFile, {})
    await expect(p).rejects.toThrow(/no such file or directory/)
  })

  it('outputJson success even path not exist', async () => {
    await outputJson(pathNotExistFile, {})
    const r = await pathExists(pathNotExistFile)
    expect(r).toBe(true)
  })
})

describe.only('fileURLToPath is ok', () => {
  it('import.meta.url startsWith file:/// and endsWith fs.test.js', async () => {
    const thisFile = import.meta.url
    expect(thisFile.startsWith('file:///')).toBe(true)
    expect(thisFile.endsWith('fs.test.js')).toBe(true)
  })
  
  it('fileURLToPath meta.url not startsWith file:///, is absolute path', () => {
    const thisFile = import.meta.url
    const filepath = fileURLToPath(thisFile)
    expect(filepath.startsWith('file:///')).toBe(false)
    expect(isAbsolute(filepath)).toBe(true)
  })
})