import { ensureJson, readJson, writeJson } from "./fs.js"
import { ask, password } from "./prompt.js"

const isValid = (val) => {
  return val !== undefined && val !== null && val !== ''
}
const isObject = (val)=>{
  return Object.prototype.toString.call(val)
}

const _base = async ({
  key,
  value,
  file = '.env.json',
  prompt = `${key} required: `,
  secret = true
} = {}) => {
  await ensureJson(file)
  const cfg = await readJson(file)
  if (isValid(cfg[key])) {
    return cfg[key]
  } else {
    const promptMethod = secret ? password : ask
    const val = isValid(value) ? value : await promptMethod(prompt)
    if (!val.trim()) {
      return await _jenv({key, value: val, file, prompt, secret })
    }
    cfg[key] = val
    await writeJson(file, cfg, {
      spaces: 2
    })
    return val
  }
}

export const _jenv = async (key, value, options) => {
  if (isValid(options)) {
    return await _base({
      key,
      value,
      ...options
    })
  } else if(isObject(value)) {
    return await _base({
      key,
      ...value
    })
  } else {
    return await _base({
      key,
      value
    })
  }
}

export const jenv = _jenv

// const env = async (envKey, promptConfig) => {
//   if (!envKey) throw new Error(`Environment Key Required`)

//   if (process.env[envKey]) {
//     global.env[envKey] = process.env[envKey]
//     return process.env[envKey]
//   } else {
//     const promptString = promptConfig ? promptConfig : `enter ${envKey}`
//     let input = await ask(promptString)
//     await setEnv(envKey, input)
//     global.env[envKey] = process.env[envKey] = input
//     return input
//   }
// }

// let envFile = '.env'
// let updateEnv = async (envKey, envValue) => {
//   let regex = new RegExp("^" + envKey + "=.*$")
//   sed("-i", regex, envKey + "=" + envValue, envFile)
//   env[envKey] = envValue
// }
// let writeNewEnv = async (envKey, envValue) => {
//   await appendFile(envFile, `\n${envKey}=${envValue}`)
//   env[envKey] = envValue
// }

// let isExist = async (envKey) => {
//   let contents = await readFile(envFile, "utf-8");
//   return contents.match(
//     new RegExp("^" + envKey + "=.*$", "gm")
//   )
// }

// export const setEnv = async (envKey, envValue) => {
//   const exist = await isExist(envKey);
//   if (exist) {
//     return await updateEnv(envKey, envValue);
//   } else {
//     return await writeNewEnv(envKey, envValue);
//   }
// }

// export const getEnv = async (envKey) => {
//   let contents = await readFile(envFile, "utf-8");
//   const reg = new RegExp("^" + envKey + "=(.*)$", "gm");
//   const result = reg.exec(contents)
//   return result?.[1];
// }

// await ensureFile(envFile)