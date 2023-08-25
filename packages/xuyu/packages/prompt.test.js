await import('./prompt')

it('yes or no can be run")', async () => {
  const yn = await confirm('yes or no?');
  // TODO: 此处需要在命令行中模拟用户输入
  // console.log(`yn = ${yn}`)
})

// const a = await askNumber('hello?')
// console.log(`a = ${a}`)

// const b = await select('选择：', ['a', 'b', 'ccc'])
// console.log(`b = ${b}`)


// const b2 = await select('选择：', [
//   {
//     name: 'hah',
//     value: 'hah'
//   },
//   {
//     name: 'hoho',
//     value: 'hoho'
//   }
// ])
// console.log(`b2 = ${b2}`)

// const b3 = await select('选择：', `aa//bb//cc`)
// console.log(`b3 = ${b3}`)

// const b4 = await select('选择：', `aa//bb//--//cc//-//dd//ee`)
// console.log(`b4 = ${b4}`)

// const c = await selectOrder('选择：', 'aa//bb//cc')
// console.log(`c = ${c}`)

// const d = await pwd()
// console.log(`d = ${d}`)

// const e = await checkbox('选择：', 'aa//bb//cc//dd')
// console.log(`e = ${e}`)
