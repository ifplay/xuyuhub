import { beforeEach, afterEach, describe, it, expect } from 'vitest'
import { pathExists } from './fs'
import { jsondb } from './lowdb'
import { home } from './os'
import { rm } from './trash'

const dbfile = home('.autopush/lowdb.json')

beforeEach(async () => {
  await rm(dbfile)
})

describe.only('lowdb is ok', () => {
  it(`return defaultData: {} when dbfile not exist`, async () => {
    const db = jsondb(dbfile)
    await db.read()
    const r = Object.keys(db.data).length
    expect(r).toBe(0)
  })

  it(`defaultData`, async () => {
    const db = jsondb(dbfile)
    const r = Object.keys(db.data).length
    expect(r).toBe(0)
  })
})
