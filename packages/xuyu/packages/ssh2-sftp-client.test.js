async function deploy_web(cwd) {
  await connectSSH({
    host,
    username,
    password,
    port,
  })

  const localPath = path.resolve(local, 'dist')
  if (await sftp.exists(remotePath)) {
    // await sftp.rmdir(remotePath, true)
    // console.log(`del success: ${remotePath}`)

    await sftp.rename(remotePath, `${remotePath}_bak_${nyr()}_${Date.now()}`)
    await sftp.uploadDir(localPath, remotePath)
    sftp.end()
  }

  async function connectSSH(config) {
    const { host, username, password, port } = config;
    try {
      console.log(`开始连接 ${host}`);
      await sftp.connect({
        host,
        username,
        password,
        port,
      });
      console.log(`连接 ${host} 成功`);
    } catch (err) {
      console.log(`连接失败 ${err}`);
      process.exit(1);
    }
  }
}