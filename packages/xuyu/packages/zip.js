import _archiver from 'archiver'
import AdmZip from 'adm-zip'
import { isFile, isDir } from './fs.js'
import { basename } from './path.js'

async function _zip(srcPath, targetFile) {
  srcPath = resolve(srcPath)
  const distName = pureFilename(srcPath)
  if (!targetFile) {
    targetFile = resolve(dirname(srcPath), `${distName}.zip`)
  } else {
    targetFile = resolve(targetFile)
  }
  const _isFile = await isFile(srcPath)
  const zipPath = _isFile ? '/' : `/${distName}`

  return new Promise((resolve, reject) => {
    console.log('开始压缩目录...', srcPath)
    var achive = _archiver('zip', {
      zlib: { level: 5 },
    }).on('error', function (err) {
      reject(err)
    })

    var output = createWriteStream(targetFile).on('close', function (err) {
      if (err) {
        console.log('压缩文件异常: ', err)
        return reject(err)
      }
      console.log('已生成 zip 包', targetFile)
      resolve(targetFile)
    })
    achive.pipe(output)
    if (_isFile) {
      achive.file(srcPath, {
        name: basename(srcPath),
      })
    } else {
      achive.directory(srcPath, zipPath)
    }
    achive.finalize()
  })
}

async function _admzip(filepath, zipfile, zipdir) {
  const admzip = new AdmZip()
  const isd = await isDir(filepath)
  if (isd) {
    const _zipdir = zipdir ? zipdir : basename(filepath)
    admzip.addLocalFolder(filepath, _zipdir)
  } else {
    admzip.addLocalFile(filepath, zipdir)
  }
  admzip.writeZip(zipfile)
}

// maintainEntryPath: 是否创建父目录
// overwrite: 是否覆盖
async function _admunzip(
  zipfile,
  targetDir,
  entry,
  maintainEntryPath = false,
  overwrite = false
) {
  const admzip = new AdmZip(zipfile)
  if (entry) {
    admzip.extractEntryTo(entry, targetDir, maintainEntryPath, overwrite)
  } else {
    admzip.extractAllTo(targetDir)
  }
}

async function _zipdir(dir, zipfile = `${basename(dir)}.zip`) {
  await _admzip(dir, zipfile, basename(dir))
}

export const zip = _zip
export const archiver = _archiver

export const admzip = _admzip
export const admunzip = _admunzip
export const zipdir = _zipdir
