import clipboard from 'clipboardy'

export const copy = async text => await clipboard.write(text)
export const paste = async () => await clipboard.read()
