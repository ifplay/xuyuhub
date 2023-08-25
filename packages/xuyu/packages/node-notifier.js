import notifier from 'node-notifier'

const _notify = (...args) => {
  if (typeof args[0] === 'string') {
    let notification = args[0]
    args[0] = {
      title: '\t',
      message: notification,
    }
  }

  // if timeout is not specified, use false
  if (args[0].timeout === undefined) {
    args[0].timeout = false
  }

  args[0] = Object.assign({
    title: '\t'
  }, args[0])

  return notifier.notify(...args)
}

export const notify = _notify
