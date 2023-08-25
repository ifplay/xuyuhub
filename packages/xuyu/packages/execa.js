import * as all from "execa"

export const execa = all.execa
export const execaSync = all.execaSync

export const execaCommand = all.execaCommand
export const exec = (command, options = { shell: true, cwd: process.cwd() }) => {
  return execaCommand(command, options)
}

export const execaCommandSync = all.execaCommandSync
export const execaNode = all.execaNode