let _trash = async (
  input,
  options
) => {
  let { default: trash } = await import("trash")
  return trash(input, options)
}

export const trash = _trash
export const rm = trash