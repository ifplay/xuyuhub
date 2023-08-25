await import('./crypto')
import { test, expect } from 'vitest'
import CryptoJS from 'crypto-js'

test('uuid length == 36', async () => {
  const a = await uuid()
  expect(a).toHaveLength(36)
})

const ori = 'aaa||bbb'
const encryptedText = 'MBNCfj8PN5ej6QlnyWepeQ=='
const key = MD5('hello').toUpperCase()

test(`${ori} enc result === ${encryptedText}`, () => {
  const aes = AESEncrypt(ori, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.ZeroPadding,
  })
  expect(aes).toEqual(encryptedText)
})

test(`aes dec result === ${ori}`, () => {
  const aesDec = AESDecrypt(encryptedText, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.ZeroPadding,
  })
  expect(aesDec).toEqual(ori)
})

;async () => {
  await import('../global.js')
  import CryptoJS from 'crypto-js'

  // import { SM2, SM3 } from 'gm-crypto'

  // const str = 'hello'

  // console.log('md5:', MD5(str))
  // console.log('MD5Digest:', MD5Digest(str))

  // const b = Base64Enc(str)
  // console.log('base64Enc:', b)
  // console.log('base64Dec:', Base64Dec(b))
  // console.log('SHA1:', SHA1(b))
  // console.log('SHA256:', SHA256(b))
  // console.log('SHA512:', SHA512(b))

  // const aes = AESEncrypt(hello, 'private key')
  // console.log('AESEncrypt:', aes)
  // console.log('AESDecrypt:', AESDecrypt(aes))

  // const sm2PublicKey = '04c1a3ad8cd49830ddca3bb90427373a1fade63c9f54b61c3a6e41b5c28b4938c536acbe2716d658402d857dbd778c1202ddd9313cb0117b40e3408b0659181829'
  // let loginname = 'sjywgl1'
  // let password = 'Admin@1234'

  // loginname = SM2.encrypt(SM3.digest(loginname) + loginname, sm2PublicKey, {
  //   inputEncoding: 'utf8',
  //   outputEncoding: 'base64'
  // })
  // password = SM2.encrypt(SM3.digest(password) + password, sm2PublicKey, {
  //   inputEncoding: 'utf8',
  //   outputEncoding: 'base64'
  // })

  // console.log(`
  // loginname: ${loginname}
  // password: ${password}
  // `)

  // const str = 'user1||1640970061000' // 2022-01-31 01:01:01
  // const key = MD5('goldwind').toUpperCase()
  // const aes = AESEncrypt(str, key)
  // console.log('base64 aes:', Base64Enc(aes))

  // dec
  const sign = 'S09UZ3QrRmhFcStNb1g0TzM1QWVWMXZ3UG1ZNXJMTWpPaTJoWFNSMmd5TT0='
  const decSign = Base64Dec(sign)
  const key = MD5('goldwind').toUpperCase()
  const aesDec = AESDecrypt(decSign, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.ZeroPadding,
  })
  console.log('aesdec:', aesDec)

  const s = 'KOTgt+FhEq+MoX4O35AeV1vwPmY5rLMjOi2hXSR2gyM='
  const a = CryptoJS.AES.decrypt(
    s,
    CryptoJS.enc.Utf8.parse(MD5('goldwind').toUpperCase()),
    {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.ZeroPadding,
    }
  )
  console.log('xxx:', a.toString(CryptoJS.enc.Utf8))
}
