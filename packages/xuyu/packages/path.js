import _path from 'path'

export const path = _path
export const resolve = _path.resolve
export const join = _path.join
export const dirname = _path.dirname
export const basename = _path.basename
export const extname = _path.extname
export const relative = _path.relative
export const normalize = _path.normalize
export const isAbsolute = _path.isAbsolute
export const sep = _path.sep
export const delimiter = _path.delimiter
export const parse = _path.parse
export const posixPath = _path.posix
export const winPath = _path.win32
export const pureFilename = path => basename(path, extname(path))
export const filenameWithoutExt = pureFilename
