/////////////////// utils ///////////////////
import { platform, homedir } from 'os'
import { resolve } from './path.js'

export const isWin = platform().startsWith('win')
export const isMac = platform().startsWith('darwin')
export const isLinux = platform().startsWith('linux')
export const cmd = isMac ? 'cmd' : 'ctrl'
export const returnOrEnter = isMac ? 'return' : 'enter'
export const wait = async time => new Promise(resolve => setTimeout(resolve, time))
export const home = (...pathParts) => resolve(homedir(), ...pathParts)