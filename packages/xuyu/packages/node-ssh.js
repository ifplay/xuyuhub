import { NodeSSH } from 'node-ssh'
import path from 'path'

async function _useSSH(config = {}) {
  const ssh = new NodeSSH()
  await connect(config)

  async function connect(config) {
    const { host, username, password, port = 22 } = config
    try {
      console.log(`==> 开始连接 ${host}`)
      await ssh.connect({
        host,
        username,
        password,
        port,
      })
      console.log(`<== 连接 ${host} 成功`)
    } catch (err) {
      console.log(`<== 连接失败 ${err}`)
      process.exit(1)
    }
  }

  // 命令无论执行成功与否都不会报错退出程序而是都返回一个包含 code 的对象
  async function remoteRun(command, cwd) {
    console.log('==> remote run command: ', command)
    const log = chunk => console.log(chunk.toString('utf8'))

    let cmdOption = {
      onStdout: log,
      onStderr: log,
    }
    if (cwd) {
      cmdOption.cwd = cwd
    }

    if (cwd) {
      console.log(`cwd: ${cwd}`)
    }

    const result = await ssh.execCommand(command, cmdOption)
    console.log('<== remote run command: ', command, '\n\n')
    return result
  }

  async function upload(localFile, remoteFile) {
    // remoteFile 中不存在的路径会自动创建
    // remoteFile 如果存在则会覆盖
    try {
      console.log(`==> 开始上传至 ${config.host}${remoteFile}...`)
      await ssh.putFile(localFile, remoteFile)
      console.log(`<== ${localFile} 上传成功`)
    } catch (err) {
      console.log(`<== ${localFile} 上传失败: `, err)
      process.exit(1)
    }
  }

  function _getNameExt(filepath) {
    const dirpath = path.dirname(filepath)
    const ext = path.extname(filepath)
    const filename = path.basename(filepath, ext)
    return [`${dirpath}/${filename}`, ext]
  }
  function _getFileBakName(file) {
    const [name, ext] = _getNameExt(file)
    return `$(date "+${name}_bak_%Y%m%d_%H%M%S${ext}")`
  }

  async function rename(fileOrDir, target, cwd) {
    const run = withRun(remoteRun, {
      start: `mv 开始：${fileOrDir} => ${target}`,
      success: `mv 成功：${fileOrDir} => ${target}`,
    })
    return await run(`mv "${fileOrDir}" "${target}"`, cwd)
  }

  async function renameBak(fileOrDir, cwd) {
    const target = _getFileBakName(fileOrDir)
    return await rename(fileOrDir, target, cwd)
  }

  async function copy(fileOrDir, target, cwd) {
    const run = withRun(remoteRun, {
      start: `cp 开始: ${fileOrDir} => ${target}`,
      success: `cp 成功: ${fileOrDir} => ${target}`,
      fail: `cp 失败: ${fileOrDir} => ${target}`,
    })
    return await run(`cp -r "${fileOrDir}" "${target}"`, cwd)
  }

  async function copyBak(fileOrDir, cwd) {
    const target = _getFileBakName(fileOrDir)
    return await copy(fileOrDir, target, cwd)
  }

  async function remove(file, cwd) {
    const run = withRun(remoteRun, {
      start: `删除开始：${file}`,
      success: `删除成功: ${file}`,
    })
    return await run(`rm ${file}`, cwd)
  }

  async function removeDir(dir, cwd) {
    const run = withRun(remoteRun, {
      start: `目录删除开始：${dir}`,
      success: `目录删除成功: ${dir}`,
    })
    if (!dir) {
      throw new Error('<!= 需要待删除的 dir 参数')
    }
    return await run(`rm -rf "${dir}"`, cwd)
  }

  async function zip(zipName, source, cwd) {
    const run = withRun(remoteRun, {
      start: `压缩开始`,
      success: `压缩成功`,
    })

    return await run(`zip -r ${zipName} ${source}`, cwd)
  }
  async function zipDir(dir, cwd) {
    const run = withRun(remoteRun, {
      start: `压缩目录开始`,
      success: `压缩目录成功`,
    })

    return await run(`zip -r "${dir}.zip" ${dir}`, cwd)
  }
  async function unzip(file, cwd) {
    const run = withRun(remoteRun, {
      start: `解压开始：${file}`,
      success: `解压成功: ${file}`,
    })
    return await run(`unzip ${file}`, cwd)
  }

  async function exist(file, cwd) {
    console.log('check file exist:', file)
    const { code } = await remoteRun(`ls ${file}`, cwd)
    if (code === 0) {
      return true
    } else {
      return false
    }
  }

  function withRun(
    func,
    { start = '', success = '', fail = '', log = false } = {}
  ) {
    return async function (...params) {
      start && console.log('==>', start)
      const result = await func(...params)
      log && console.log('command run result: ', result)
      if (result.code === 0) {
        success && console.log('<==', success, '\n')
        return result
      } else {
        fail && console.log('<==', fail, '\n')
        // process.exit(1)
        throw new Error(result.stderr)
      }
    }
  }

  Object.assign(ssh, {
    exist,
    remoteRun,
    upload,
    remove,
    removeDir,
    rename,
    renameBak,
    copy,
    copyBak,
    zip,
    zipDir,
    unzip,
  })

  return ssh
}

export const useSSH = _useSSH
