#! /usr/bin/env node

await import('./fs.js')
import { beforeEach, afterEach, describe, it, expect } from 'vitest'
import { useSSH } from './node-ssh.js'
import { resolve } from './path.js'

const localPath = resolve('E:/codes/webclient')
const remotePath = '/data/data/com.termux/files/home/tmp'
const unsafeDir = `${remotePath}/znxs_deploy_site_unsafe`
const safeDir = `${remotePath}/znxs`
const zipFileName = 'dist.zip'
const host = '192.168.137.214'
const username = 'u0_a269'
const password = 'wsm11mma'
const port = 8022
const sshConfig = {
  host,
  username,
  password,
  // privateKeyPath,
  port,
}

const ssh = await useSSH(sshConfig)

// await ssh.copyBak(['-r', 'dist.zip', 'dist3.zip'], remotePath)
// await ssh.renameBak('dist.zip', remotePath)
// await ssh.zip('hello.zip hello.txt', remotePath)

describe('node-ssh connect right', () => {
  it('connection is defined', async () => {
    expect(ssh.connection).not.toBe(undefined)
  })

  it('connection is connected', async () => {
    expect(ssh.isConnected()).toBe(true)
  })
})

// * 判断目录与文件是否存在
// * 删除已有目录和文件
describe('exist, mkdir, removeDir is ok', () => {
  const target = `${remotePath}/hello`
  it(`${target} not exist`, async () => {
    const r = await ssh.exist(target)
    expect(r).toBe(false)
  })

  it(`${target} is exist`, async () => {
    await ssh.remoteRun('mkdir hello', remotePath)
    const r = await ssh.exist(target)
    expect(r).toBe(true)
  })

  it(`${target} not exist after removeDir`, async () => {
    await ssh.removeDir(target)
    const r = await ssh.exist(target)
    expect(r).toBe(false)
  })

  it(`removeDir to a not exist dir not throw error`, async () => {
    const r = await ssh.removeDir('/a/not/exist/dir')
    expect(r.code).toBe(0)
  })
})

// * 上传文件 putFile, putFiles
const localFile = resolve(localPath, zipFileName)
const remoteFile = `${remotePath}/${zipFileName}`
const remoteNotExistDir = `${remotePath}/notExist`
const remoteFileBelongDirNotExist = `${remoteNotExistDir}/${zipFileName}`
const remoteMultiDir = `${remotePath}/multi`
const multiFiles = [
  {
    local: resolve(localPath, 'run.sh'),
    remote: `${remoteMultiDir}/run.sh`,
  },
  {
    local: resolve(localPath, 'build.sh'),
    remote: `${remoteMultiDir}/build.sh`,
  },
]
describe('putFile is ok', async () => {
  it(`${remoteFile} not exist`, async () => {
    const r = await ssh.exist(remoteFile)
    expect(r).toBe(false)
  })

  // remoteFile 如果已经存在则会覆盖
  it(`${remoteFile} is exist after upload`, async () => {
    await ssh.putFile(localFile, remoteFile)
    const r = await ssh.exist(remoteFile)
    expect(r).toBe(true)
  })

  it(`${remoteFile} not exist after remove`, async () => {
    await ssh.remove(remoteFile)
    const r = await ssh.exist(remoteFile)
    expect(r).toBe(false)
  })

  it(`localFile not exist, throw error`, async () => {
    const p = ssh.putFile(localFile + 'x', remoteFile)
    await expect(p).rejects.toThrow(/does not exist at/)
  })

  // * 上传文件时如果远程目录不存在会怎样，多级子目录是否会自动创建
  // ==> 会自动创建
  it(`remoteFile dir not exist could upload success`, async () => {
    await ssh.putFile(localFile, remoteFileBelongDirNotExist)
    const r = await ssh.exist(remoteFileBelongDirNotExist)
    expect(r).toBe(true)
  })

  it(`upload multi files could success`, async () => {
    await ssh.putFiles(multiFiles)
    const [r1, r2] = [
      await ssh.exist(multiFiles[0].remote),
      await ssh.exist(multiFiles[1].remote),
    ]
    expect(r1).toBe(true)
    expect(r2).toBe(true)
  })

  // 删除不存在的目录并不会报错
  it(`remote notExist/multi dir not exist after removeDir`, async () => {
    await ssh.removeDir(remoteNotExistDir)
    await ssh.removeDir(remoteMultiDir)
    const [r1, r2] = [
      await ssh.exist(remoteNotExistDir),
      await ssh.exist(remoteMultiDir),
    ]
    expect(r1).toBe(false)
    expect(r2).toBe(false)
  })
})

// * 下载文件 getFile
const downloadLocal = 'D:/Downloads/test/download.txt'
const downloadLocalDirNotExist = 'D:/Downloads/test2/download.txt'
const downloadRemote = `${remotePath}/download.txt`
describe('getFile is ok', () => {
  it(`${downloadRemote} not exist, throw error`, async () => {
    const p = ssh.getFile(downloadLocal, downloadRemote)
    await expect(p).rejects.toThrow('No such file')
  })

  // 下载时如果本地文件已经存在则会覆盖
  it(`${downloadRemote} could download success`, async () => {
    await ssh.remoteRun('echo "downlaod" > download.txt', remotePath)

    const localFileDir = await dirname(downloadLocal)
    console.log('ensureDir:', localFileDir)
    ensureDir(localFileDir)

    await ssh.getFile(downloadLocal, downloadRemote)
    const r = await pathExists(downloadLocal)
    expect(r).toBe(true)
    await ssh.remove(downloadRemote)
  })

  it(`downloadLocal dir not exist, throw error`, async () => {
    await ssh.remoteRun('echo "downlaod" > download.txt', remotePath)
    const p = ssh.getFile(downloadLocalDirNotExist, downloadRemote)
    await expect(p).rejects.toThrow(/no such file or directory/)
    await ssh.remove(downloadRemote)
  })
})

// * 上传目录
const localDir = resolve(localPath, 'dist')
const remoteDir = `${remotePath}/dist`
describe('putDirectory is ok', () => {
  it.skip(`${remoteDir} not exist`, async () => {
    const r = await ssh.exist(remoteDir)
    expect(r).toBe(false)
  })

  // 已存在的目录及文件会被自动覆盖
  it(`${remoteDir} exist after putDirectory`, async () => {
    await ssh.putDirectory(localDir, remoteDir, {
      recursive: true,
      concurrency: 10,
    })
    const r = await ssh.exist(remoteDir)
    expect(r).toBe(true)
  }, 60000)

  // ssh.removeDir(remoteDir)
})

// * 下载目录
const downloadLocalDir = 'D:/Downloads/downloadDir'
const downloadRemoteDir = `${remotePath}/downloadDir`
describe('getDirectory is ok', async () => {
  it(`${downloadRemoteDir} not exist, getDirectory throww error`, async () => {
    const p = ssh.getDirectory(downloadLocalDir, downloadRemoteDir)
    await expect(p).rejects.toThrow(/No such file/)
  })

  // 本地目录若不为空，在目录内容会进行合并；目录中存在同明文件则会被覆盖
  it(`${downloadRemoteDir} could downlaod success`, async () => {
    await ssh.remoteRun('mkdir downloadDir', remotePath)
    await ssh.remoteRun('echo "xxx" > downloadDir/down.txt', remotePath)
    await ensureDir(downloadLocalDir)
    await ssh.getDirectory(downloadLocalDir, downloadRemoteDir, {
      recursive: true,
      concurrency: 10,
    })
    const r = await pathExists(downloadLocalDir)
    expect(r).toBe(true)
  }, 60000)

  it(`${downloadRemoteDir} not exist after removeDir`, async () => {
    await ssh.removeDir(downloadRemoteDir)
    const r = await ssh.exist(downloadRemoteDir)
    expect(r).toBe(false)
  }, 60000)
})

// * 重命名已有目录和文件（占用问题，失败是否继续问题）
// * 备份已有目录和文件
const cpSourceDir = `${remotePath}/dist`
const cpTargetDir = `${remotePath}/dist2`
describe('copy/rename bak is ok', async () => {
  it('copy file not exist, throw error', async () => {
    const p = ssh.copy('xxx', 'xxx2', remotePath)
    await expect(p).rejects.toThrow(/No such file or directory/)
  })

  // 如果目标目录已存在，则会将源目录复制到目标目录下面
  it('copy dir success', async () => {
    await ssh.copy(cpSourceDir, cpTargetDir)
    const r = await ssh.exist(cpTargetDir)
    expect(r).toBe(true)
  })

  it('if targetDir exist, sourceDir will place in targetDir', async () => {
    await ssh.copy(cpSourceDir, cpTargetDir)
    const r = await ssh.exist(`${cpTargetDir}/dist`)
    expect(r).toBe(true)
  })

  it('dir copyBak success', async () => {
    await ssh.remoteRun('rm -rf dist_bak*', remotePath)
    const r = await ssh.exist(`${cpSourceDir}_bak*`)
    expect(r).toBe(false)
    await ssh.copyBak(cpSourceDir)
    const r2 = await ssh.exist(`${cpSourceDir}_bak*`)
    expect(r2).toBe(true)
    await ssh.remoteRun('rm -rf dist_bak*', remotePath)
  })

  it('file copyBak success', async () => {
    await ssh.remoteRun('echo "hello" > hello.txt', remotePath)
    await ssh.copyBak(`${remotePath}/hello.txt`)
    const r = await ssh.exist(`${remotePath}/hello_bak*`)
    expect(r).toBe(true)
    await ssh.remove('hello.txt', remotePath)
    await ssh.remove('hello_bak*', remotePath)
  })

  it(`${cpTargetDir} not exist after removeDir`, async () => {
    await ssh.removeDir(cpTargetDir)
    const r = await ssh.exist(cpTargetDir)
    expect(r).toBe(false)
  })
})

// * 压缩包含有顶层目录解压（dist.zip/dist/）
// * 压缩包不含顶层目录解压（dist.zip/*）
describe('zip/unzip is ok', async () => {
  beforeEach(async () => {
    await ssh.remoteRun('mkdir adir', remotePath)
    await ssh.remoteRun('echo aaa > adir/aaa.txt', remotePath)
    await ssh.remoteRun('echo bbb > adir/bbb.txt', remotePath)
    await ssh.remoteRun('echo ccc > adir/ccc.txt', remotePath)
  })
  afterEach(async () => {
    await ssh.removeDir('adir', remotePath)
    await ssh.remove('adir.zip', remotePath)
  })

  it('hello.zip exist after zip', async () => {
    await ssh.zip('aaa.zip', 'adir/aaa.txt', remotePath)
    const r = await ssh.exist('aaa.zip', remotePath)
    expect(r).toBe(true)
    await ssh.remove('aaa.zip', remotePath)
  })

  // 如果目标压缩包已经存在则会进行融合覆盖（压缩包内同名文件会被覆盖）
  it('adir.zip exist after zip', async () => {
    await ssh.zipDir('adir', remotePath)
    const r = await ssh.exist('adir.zip', remotePath)
    expect(r).toBe(true)
  })

  it('ddd/aaa.txt exist after unzip', async () => {
    await ssh.zipDir('adir', remotePath)
    await ssh.unzip('-o adir.zip -d ddd', remotePath)
    const r = await ssh.exist('ddd/adir/aaa.txt', remotePath)
    expect(r).toBe(true)
    await ssh.removeDir('ddd', remotePath)
  })
})
