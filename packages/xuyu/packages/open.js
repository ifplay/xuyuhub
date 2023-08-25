export const open = async (target, options) => {
  let { default: _o } = await import('open')
  return _o(target, options)
}
