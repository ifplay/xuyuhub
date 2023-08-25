// let { default: shelljs } = await import("shelljs")
import shelljs from 'shelljs'

export const cp = shelljs.cp
export const chmod = shelljs.chmod
export const echo = shelljs.echo
export const exit = shelljs.exit
export const grep = shelljs.grep
export const ln = shelljs.ln
export const ls = shelljs.ls
export const mkdir = shelljs.mkdir
export const mv = shelljs.mv
export const sed = shelljs.sed
export const tempdir = shelljs.tempdir
export const shelltest = shelljs.test // 跟 jest 的 test 冲突
export const which = shelljs.which
export const pwd = shelljs.pwd
export const shell = shelljs