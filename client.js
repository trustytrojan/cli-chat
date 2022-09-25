const { Socket } = require('net')
const readline = require('readline')
const { existsSync, writeFileSync } = require('fs')

const config_filename = './chat-client-config.json'

let host, port, name
if(existsSync(config_filename)) {
  console.log(`Reading config file...`)
  ;({ host, port, name } = require(config_filename))
  let config_errors = ''
  if(typeof host !== 'string')
    config_errors += `  Property "host" must be of type string.\n    Example: "host": "1.2.3.4"\n`
  if(typeof port !== 'number')
    config_errors += `  Property "port" must be a number.\n    Example: "port": 12345\n`
  if(typeof name !== 'string')
    config_errors += `  Property "host" must be a string.\n    Example: "name": "johndoe"\n`
  if(name.length === 0)
    config_errors += `  Property "name" is an empty string. You need a name to chat.\n`
  if(config_errors.length > 0) {
    console.error('Your configuration file is erroneous! Please read the errors below to fix them.')
    process.stderr.write(config_errors)
    process.exit(1)
  }
} else {
  console.error('Config file does not exist. Creating one now...')
  writeFileSync(config_filename, JSON.stringify({ host: '1.2.3.4', port: 12345, name: '' }, null, '  '))
  console.error(`Please edit the generated config file (${config_filename}) and run me again`)
  process.exit(1)
}

const server_address = `${host}:${port}`
const msg_prompt = '> '

const client = new Socket()

client.on('error', console.error)

client.on('data', (data) => {
  rl.pause()
  const message = data.toString()
  process.stdout.write('\n')
  resetCursor()
  console.log(message)
  process.stdout.write(msg_prompt)
  rl.resume()
})

console.log(`Connecting to server at ${server_address}`)
client.connect(port, host, async () => {
  console.log(`You're connected. Say hi!`)
  while(true) {
    const message = await prompt(msg_prompt)
    if(message.length === 0) continue
    if(message.startsWith)
    resetCursor()
    client.write(`[${name}] ${message}`)
    await awaitData().catch(timedOut)
  }
})

function resetCursor() {
  readline.moveCursor(process.stdout, 0, -1)
  readline.clearLine(process.stdout, 0)
  readline.cursorTo(process.stdout, 0)
}

/**
 * Wait 5 seconds for the server's response.
 * Resolve with the data received.
 * Reject if the server took too long.
 * @returns {Promise<Buffer>}
 */
async function awaitData() {
  return new Promise((resolve, reject) => {
    setTimeout(reject, 5_000)
    client.once('data', resolve)
  })
}

function timedOut() {
  console.log('Connection to server timed out')
  process.exit(1)
}

/**
 * Read a line from `stdin` after writing `query` to `stdout`.
 * @param {string} query 
 * @returns {Promise<string>}
 */
async function prompt(query) {
  if(typeof query !== 'string')
    throw TypeError()

  return new Promise(resolve => rl.question(query, ans => {
    resolve(ans)
  }))
}
