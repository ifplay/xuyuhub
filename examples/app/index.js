await import('xuyu/global')

// $.verbose = false
const colorText = chalk`Hello {red xuyu {green world} }{blue !!!}`
echo(colorText)

await $`echo "Hello xuyu"`
