import _replace from 'replace-in-file'

async function _replacefile(files, from, to) {
  return _replace({
    files,
    from,
    to,
  })
}

export const replaceinfile = _replace
export const replace = _replacefile
