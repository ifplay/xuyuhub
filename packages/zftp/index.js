#! /usr/bin/env node

/**
 * Teleport
 */
await import('xuyu/global')
const configDir = home('.tp')
const configFile = home(configDir, 'config.json')
await ensureConfig(configFile)
const config = await readJson(configFile)

main()

async function main() {
  const { sshConfig, localFile, remoteDir } = await useConfig()

  const { client, ftp } = await useFtp(sshConfig)

  // await client.cd(project.dir)
  const bakFileName = getBakFile(localFile)
  console.log('backfilename', bakFileName)
  const remoteFile = `${remoteDir}/${bakFileName}`
  await client.uploadFrom(localFile, remoteFile)
  // const list = await client.list(remoteDir)
  // console.log(list.filter(x => x.type === ftp.FileType.File))

  console.log(bakFileName)
  await copy(bakFileName)
  console.log('Copied:', bakFileName)
  console.log('Upload Success:', remoteFile)

  client.close()
}

async function ensureConfig(cfgFile) {
  const exist = await pathExists(cfgFile)
  if (!exist) {
    await ensureJson(
      cfgFile,
      {
        ftp: {
          ssh: {
            host: '192.168.4.211',
            port: 21,
            username: 'wangzhen@whayer.cn',
            desc: 'FTP',
          },
          mengxi: {
            dir: '/version/Software/Products/SISS-10000/SISS-10000.LX2 2.5.0.X（蒙西辅控巡视系统项目）/',
            sub: 'Roll1/补丁',
          },
        },
      },
      {
        spaces: 2,
      }
    )
    console.log(`Init: ${configFile}`)
  }
}

async function ensurePassword(server, key = 'password') {
  const file = home(configDir, `${server}.env.json`)
  const password = await jenv(key, { file })
  return password
}

async function getFinalSshConfig(server, sshConfig) {
  const password = await ensurePassword(server)
  return Object.assign({}, sshConfig, {
    password,
  })
}

function getBakFile(file) {
  return `${pureFilename(file)}_${filenameSafeSj()}${extname(file)}`
}

async function useConfig() {
  const { _: files, ss } = argv
  if (files.length === 0) {
    console.log('需要传入待上传文件: tp file\n')
    process.exit(1)
  }

  const localFile = files[0]

  if (ss) {
    const [server, project] = ss.split('/')
    const { sshConfig, remoteDir } = await getConfigByServerProject(server, project)
    return {
      sshConfig,
      localFile,
      remoteDir,
    }
  } else {
    const selectedServer = await selectServer()
    const selectedProject = await selectProject(selectedServer)
    const { sshConfig, remoteDir } = await getConfigByServerProject(selectedServer, selectedProject)
    return {
      sshConfig,
      localFile,
      remoteDir,
    }
  }
}

async function getConfigByServerProject(server, project) {
  let sshConfig, remoteDir
  if (config[server]?.ssh && config[server]?.[project]) {
    const target = config[server]
    sshConfig = await getFinalSshConfig(server, target.ssh)
    const site = target[project]
    if (site?.dir) {
      const { dir, sub = '' } = site
      remoteDir = posixPath.join(dir, sub)
    }
  }
  if (sshConfig && remoteDir) {
    return {
      sshConfig,
      remoteDir,
    }
  } else {
    tip(`未找到 ${server}/${project} 对应配置`)
    process.exit(1)
  }
}

async function selectServer() {
  const serverChoices = getServerChoices(config)
  let serverSelect = await select('请选择服务器：', serverChoices)
  if (serverSelect === 0) {
    serverSelect = await createServer(config)
  }
  return serverSelect
}

async function selectProject(serverName) {
  const projectChoices = getProjectChoices(serverName, config)
  let value = await select('请选择项目：', projectChoices)
  if (value === 0) {
    value = await createProject(serverName, config)
  }
  return value
}

function getServerChoices(config) {
  let choices = [
    {
      name: '新建服务器配置',
      value: 0,
    },
  ]
  const keys = Object.keys(config)
  keys.map(key => {
    const target = config[key]
    if (target?.ssh) {
      choices.push({
        name: `${key} (${target.ssh.host})`,
        value: key,
      })
    }
  })
  return choices
}

function getProjectChoices(serverName, config) {
  let choices = [
    {
      name: '新建项目',
      value: 0,
    },
  ]
  const target = config[serverName]
  const keys = Object.keys(target).filter(x => x !== 'ssh')
  keys.map(key => {
    const project = target[key]
    if (project?.dir) {
      const value = posixPath.join(project.dir, project.sub)
      choices.push({
        name: `${key} (${value})`,
        value: key,
      })
    }
  })
  return choices
}

async function createServer(config) {
  const serverName = await askServerName()
  const ssh = {
    host: await askHost(),
    port: await askPort(),
    username: await askUsername(),
  }

  if (!config[serverName]) {
    config[serverName] = {}
  }
  config[serverName].ssh = ssh
  await outputJson(configFile, config, {
    spaces: 2,
  })
  await ensurePassword(serverName)
  return serverName
}

async function createProject(serverName, config) {
  const projectName = await askProjectName(serverName, config)
  const dir = await askProjectDir()
  const sub = await askProjectSub()

  config[serverName][projectName] = { dir, sub }
  await outputJson(configFile, config, {
    spaces: 2,
  })
  return projectName
}

async function askServerName() {
  const serverName = await ask('请输入服务器标识(英文)：')
  if (isEmpty(serverName)) {
    tip('服务器标识不能为空')
    return await askServerName()
  }
  if (config[serverName]?.ssh?.host) {
    tip(`已经存在名为 ${serverName} 的服务器配置`)
    return await askServerName()
  }
  return serverName.trim()
}

async function askHost() {
  const host = await ask('请输入服务器地址：')
  if (isEmpty(host)) {
    tip('服务器地址不能为空')
    return await askHost()
  }
  return host.trim()
}

async function askPort() {
  const port = await askNumber('请输入端口号：', 21)
  if (isEmpty(port)) {
    tip('端口号不能为空')
    return await askPort()
  }
  return port
}

async function askUsername() {
  const username = await ask('请输入登录用户：')
  if (isEmpty(username)) {
    tip('登录用户不能为空')
    return await askUsername()
  }
  return username.trim()
}

async function askProjectName(serverName, config) {
  const projectName = await ask('请输入项目标识(英文)：')
  if (isEmpty(projectName)) {
    tip('项目标识不能为空')
    return await askProjectName(arguments)
  }
  if (config[serverName]?.[projectName]) {
    tip(`已经存在名为 ${projectName} 的项目配置`)
    return await askProjectName(arguments)
  }
  return projectName.trim()
}

async function askProjectDir() {
  const dir = await ask('请输入项目路径：')
  if (isEmpty(dir)) {
    tip('项目路径不能为空')
    return await askProjectDir()
  }
  return dir.trim()
}

async function askProjectSub() {
  const sub = await ask('请输入项目相对子路径（可选）：')
  return isEmpty(sub) ? '' : sub.trim()
}

function tip(text) {
  console.log(`\n\t${text}！\n`)
}

function isEmpty(value) {
  return !value || !String(value).trim()
}
