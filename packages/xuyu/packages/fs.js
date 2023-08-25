import fs from "fs"
import fsPromises from "fs/promises"
import fse from "fs-extra"
import url from 'node:url'

export const isFile = async (path) => {
  try {
    const st = await lstat(path);
    return st.isFile();
  } catch {
    return false;
  }
}

export const isDir = async (path) => {
  try {
    const st = await lstat(path);
    return st.isDirectory();
  } catch {
    return false;
  }
}

const _ensureJson = async (file, object = {}, ...params) => {
  const r = await fse.pathExists(file)
  if (!r) {
    await fse.outputJson(file, object, ...params)
  }
}

export const readFile = fsPromises.readFile
export const writeFile = fsPromises.writeFile
export const appendFile = fsPromises.appendFile
export const readdir = fsPromises.readdir
export const copyFile = fsPromises.copyFile
export const stat = fsPromises.stat
export const lstat = fsPromises.lstat

export const createReadStream = fs.createReadStream
export const createWriteStream = fs.createWriteStream

export const emptyDir = fse.emptyDir
export const ensureFile = fse.ensureFile
export const ensureDir = fse.ensureDir
export const ensureJson = _ensureJson
export const ensureLink = fse.ensureLink
export const ensureSymlink = fse.ensureSymlink
export const mkdirp = fse.mkdirp
export const mkdirs = fse.mkdirs
export const outputFile = fse.outputFile
export const outputJson = fse.outputJson
export const pathExists = fse.pathExists
export const remove = fse.remove
export const readJson = fse.readJson
export const writeJson = fse.writeJson

export const fileURLToPath = url.fileURLToPath