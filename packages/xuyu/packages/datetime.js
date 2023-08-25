function _getDate(val) {
  let d
  if (val) {
    if (typeof val === 'string') {
      d = new Date(val)
    } else {
      d = val
    }
  } else {
    d = new Date()
  }
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const date = d.getDate()
  const hour = d.getHours()
  const minute = d.getMinutes()
  const second = d.getSeconds()
  return {
    year,
    month,
    date,
    hour,
    minute,
    second,
  }
}
function pad(val) {
  return val.toString().padStart(2, '0')
}

function _nyr(val) {
  const { year, month, date } = _getDate(val)
  return `${year}-${pad(month)}-${pad(date)}`
}
function _sfm(val) {
  const { hour, minute, second } = _getDate(val)
  return `${pad(hour)}:${pad(minute)}:${pad(second)}`
}
function _sj(val) {
  const { year, month, date, hour, minute, second } = _getDate(val)
  return `${year}-${pad(month)}-${pad(date)} ${pad(hour)}:${pad(minute)}:${pad(
    second
  )}`
}
function _filenameSafeSj(val) {
  const { year, month, date, hour, minute, second } = _getDate(val)
  return `${year}-${pad(month)}-${pad(date)}_${pad(hour)}${pad(minute)}${pad(
    second
  )}`
}

export const nyr = _nyr
export const sfm = _sfm
export const sj = _sj
export const filenameSafeSj = _filenameSafeSj
