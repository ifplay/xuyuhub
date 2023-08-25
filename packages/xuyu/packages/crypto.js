import crypto from 'crypto'
import CryptoJS from 'crypto-js'

function _MD5(msg) {
  return CryptoJS.MD5(msg).toString()
}

function _MD5Digest(msg) {
  return crypto.createHash('md5').update(msg).digest('hex')
}

function _Base64Enc(msg) {
  // btoa(msg);
  const wordArray = CryptoJS.enc.Utf8.parse(msg)
  return CryptoJS.enc.Base64.stringify(wordArray)
}
function _Base64Dec(msg) {
  const parsedWordArray = CryptoJS.enc.Base64.parse(msg)
  return parsedWordArray.toString(CryptoJS.enc.Utf8)
}

// SHA1
function _SHA1(msg) {
  return CryptoJS.SHA1(msg).toString()
}

// SHA2
function _SHA256(msg) {
  return CryptoJS.SHA256(msg).toString()
}
function _SHA512(msg) {
  return CryptoJS.SHA512(msg).toString()
}

// Sample
// var encrypted = CryptoJS.AES.encrypt("Message", "Secret Passphrase", {
//   mode: CryptoJS.mode.CFB,
//   padding: CryptoJS.pad.AnsiX923
// });
function _AESEncrypt(
  msg,
  key,
  opt = {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }
) {
  return CryptoJS.AES.encrypt(
    msg,
    CryptoJS.enc.Utf8.parse(key),
    opt
  ).toString()
}

function _AESDecrypt(
  msg,
  key,
  opt = {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }
) {
  return CryptoJS.AES.decrypt(msg, CryptoJS.enc.Utf8.parse(key), opt).toString(
    CryptoJS.enc.Utf8
  )
}

function _DESEncrypt() {}
function _DESDecrypt() {}

export const uuid = crypto.randomUUID
export const MD5 = _MD5
export const MD5Digest = _MD5Digest
export const Base64Enc = _Base64Enc
export const Base64Dec = _Base64Dec
export const SHA1 = _SHA1
export const SHA256 = _SHA256
export const SHA512 = _SHA512
export const AESEncrypt = _AESEncrypt
export const AESDecrypt = _AESDecrypt
export const DESEncrypt = _DESEncrypt
export const DESDecrypt = _DESDecrypt

// https://cryptojs.gitbook.io/docs/
