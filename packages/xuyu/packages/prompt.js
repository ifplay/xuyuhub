import inquirer from 'inquirer'
const { prompt: _prompt } = inquirer

function choicesFromStr(str) {
  return str
    .split('//')
    .map(x =>
      x.startsWith('-') && x.endsWith('-') ? new inquirer.Separator() : x
    )
}

async function _confirm(question) {
  const answer = await _prompt([
    {
      type: 'confirm',
      name: 'value',
      message: question,
    },
  ])
  return answer.value
}

async function _ask(question, defaultValue) {
  const answer = await _prompt([
    {
      type: 'input',
      name: 'value',
      message: question,
      default: defaultValue,
    },
  ])
  return answer.value
}

async function _askNumber(question, defaultValue) {
  const answer = await _prompt([
    {
      type: 'number',
      name: 'value',
      message: question,
      default: defaultValue,
      // validate(value) {
      //   if (Number.isNaN(value)) {
      //     return '请输入数字';
      //   }
      //   return true;
      // },
    },
  ])
  const value = answer.value
  if (Number.isNaN(value)) {
    console.log('请输入数字')
    return await askNumber(question)
  }
  return answer.value
}

async function _select(question, choices, type = 'list') {
  if (typeof choices === 'string') {
    choices = choicesFromStr(choices)
  }
  const answer = await _prompt([
    {
      type,
      name: 'value',
      message: question,
      choices,
    },
  ])
  return answer.value
}

async function _selectOrder(question, choices) {
  return await select(question, choices, 'rawlist')
}

async function _selectAlpha(question, choices) {
  return await select(question, choices, 'expand')
}

async function _checkbox(question, choices) {
  if (typeof choices === 'string') {
    choices = choicesFromStr(choices)
  }
  const answer = await _prompt([
    {
      type: 'checkbox',
      name: 'value',
      message: question,
      choices,
    },
  ])
  return answer.value
}

async function _editor(question) {
  const answer = await _prompt([
    {
      type: 'editor',
      name: 'value',
      message: question,
    },
  ])
  return answer.value
}

async function _pwd(question = '请输入密码:') {
  const answer = await _prompt([
    {
      type: 'password',
      name: 'value',
      mask: '*',
      message: question,
    },
  ])
  return answer.value
}

export const prompt = _prompt
export const confirm = _confirm
export const ask = _ask
export const askNumber = _askNumber
export const select = _select
export const selectOrder = _selectOrder
export const selectAlpha = _selectAlpha
export const checkbox = _checkbox
export const password = _pwd
