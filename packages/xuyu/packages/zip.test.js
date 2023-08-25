import { admunzip, admzip } from './zip.js'
import { pathExists } from './fs.js'
import { rm } from './trash.js'
import { beforeEach, afterEach, describe, it, expect } from 'vitest'

const testDir = 'E:/playgournd/autopush/test'

const srcPath = `${testDir}/dist`
const zipPath = `${testDir}/dist.zip`

const srcFile = `${testDir}/index.js`
const zipFile = `${testDir}/index.zip`


const extractDir = `${testDir}/tmp`
const extractPath = `${extractDir}/dist`
const extractFile = `${extractDir}/hello/world/hello.txt`

beforeEach(async () => {
  if (await pathExists(zipPath)) {
    await rm(zipPath)
  }
})

afterEach(async () => {
  await rm(zipPath)
  await rm(zipFile)
})

describe('zip is ok', () => {
  // 覆盖关系，压缩包内的文件不会产生融合
  // 目录压缩不传第三个参数默认会已目录名作为压缩包中的根目录
  it(`zip dir success, zipPath exist after admZip`, async () => {
    await admzip(srcPath, zipPath)
    const r = await pathExists(zipPath)
    expect(r).toBe(true)
  })

  it(`unzip dir success, ${extractPath} exist after unzip`, async () => {
    await admzip(srcPath, zipPath)
    await admunzip(zipPath, extractDir)
    const r = await pathExists(extractPath)
    expect(r).toBe(true)
  })

  it(`zip file success, zipFile exist after admZip`, async () => {
    await admzip(srcFile, zipFile, 'files')
    const r = await pathExists(zipFile)
    expect(r).toBe(true)
  })

  it(`unzip file success, ${extractPath} exist after unzip`, async () => {
    await admzip(srcPath, zipPath, 'hello/world')
    await admunzip(zipPath, `${extractDir}`)
    const r = await pathExists(extractFile)
    expect(r).toBe(true)
  })
})
