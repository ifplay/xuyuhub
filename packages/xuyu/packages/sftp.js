import Client from 'ssh2-sftp-client'
import ftp from 'basic-ftp'

export const useSftp = async (config = {}) => {
  let sftp = new Client()
  await connectSSH()

  async function connectSSH() {
    const { host, username, password, port } = config
    try {
      console.log(`开始连接 ${host}`)
      await sftp.connect({
        host,
        port,
        username,
        password,
      })
      console.log(`连接 ${host} 成功`)
      return sftp
    } catch (err) {
      console.log(`连接失败 ${err}`, err)
      process.exit(1)
    }
  }

  Object.assign(sftp, {})

  return sftp
}

export const useFtp = async (config = {}) => {
  const client = new ftp.Client()
  // client.ftp.verbose = true // 打印详细日志

  async function connect() {
    const { host, port, username: user, password } = config
    await client.access({
      host,
      port,
      user,
      password,
    })
  }

  /**
   * Client API: https://github.com/patrickjuchli/basic-ftp
   *
   * - access
   * - cd(path)
   * - send(command)
   * - pwd() get current working dir
   * - list([path]) List files and directories in the current working directory, or at path if specified
   * - lastMod(path) Get the last modification time of a file
   * - size(path)
   * - rename(path, newPath)
   * - remove(path) Remove a file.
   * - uploadFrom(readableStream | localPath, remotePath, [options])
   * - appendFrom(readableStream | localPath, remotePath, [options])
   * - downloadTo(writableStream | localPath, remotePath, startAt = 0)
   * - uploadFromDir(localDirPath, [remoteDirPath]) Upload the contents of a local directory to the current remote working directory. This will overwrite existing
   * - downloadToDir(localDirPath, [remoteDirPath])
   * - ensureDir(remoteDirPath)
   * - clearWorkingDir()
   * - removeDir(remoteDirPath) Remove all files and directories from a given directory, including the directory itself
   */

  await connect()

  return {
    client,
    ftp,
  }
}
