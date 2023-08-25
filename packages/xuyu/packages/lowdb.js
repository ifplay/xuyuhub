import * as lowdbModule from 'lowdb'
import { JSONFile } from 'lowdb/node'
const { Low } = lowdbModule

function _jsondb(file, defaultData = {}) {
  const adapter = new JSONFile(file)
  return new Low(adapter, defaultData)
}

export const lowdb = lowdbModule
export const jsondb = _jsondb