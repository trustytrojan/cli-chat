const { Socket } = require('net')
const readline = require('readline')
// const { existsSync, writeFileSync } = require('fs')
const { stdin, stdout, stderr, exit, argv } = process

if(argv.length < 4) {
  console.log(`Usage: <program_name> <ip> <port> <username>`)
  console.log(`\t<ip>\tServer IP address`)
  console.log(`\t<port>\tServer port`)
  console.log(`\t<username>\tYour username to be used in chat`)
  process.exit(0)
}

const host = argv[2]
const port = Number.parseInt(argv[3])
let name = argv[4]
const server_address = `${host}:${port}`



const rl = readline.createInterface({
  input: stdin,
  output: stdout
})

const socket = new Socket()

let timeout

socket.on('error', (err) => {
  console.error(err)
  console.error(`\nThe error above occurred when connecting to the server.\nPlease make sure you have entered the correct address and port in the config file.`)
  exit(1)
})

socket.on('data', (data) => {
  const str = data.toString()
  if(str.startsWith('heartbeat')) {
    clearTimeout(timeout)
    timeout = setTimeout(timedOut, 5_000)
    return
  }
  rl.pause()
  stdout.write('\n')
  resetCursor()
  console.log(str)
  stdout.write(rl.getPrompt())
  rl.resume()
})

console.log(`Connecting to server at ${server_address}`)
timeout = setTimeout(timedOut, 5_000)

socket.connect(port, host, async () => {
  clearTimeout(timeout)
  socket.write(`name="${name}"`)
  console.log(`You're connected. Say hi!`)
  while(true) {
    const message = await prompt(`[${name}]> `)
    resetCursor()
    if(message.length === 0) continue
    if(message.startsWith('/')) {
      const args = message.split(' ')
      commands[args.shift().slice(1)](args)
      continue
    }
    socket.write(`${message}`)
    await awaitData().catch(timedOut)
  }
})

const commands = {
  help: () => {
    console.log(`<Client> List of all commands below:`)
    console.log(`<Client> /help\tDisplays this message`)
    console.log(`<Client> /leave\tDisconnects from the server`)
    console.log(`<Client> /name <new_name>\tChange your username in this server to <new_name>`)
  },
  leave: () => {
    socket.destroy()
    console.log('You have disconnected from the server.')
    exit(0)
  },
  name: async ([ new_name ]) => {
    socket.write(`new_name="${new_name ?? await prompt(`<Client> Enter your new username: `)}"`)
    name = new_name
    await awaitData().catch(timedOut)
  }
}

function resetCursor() {
  readline.moveCursor(stdout, 0, -1)
  readline.clearLine(stdout, 0)
  readline.cursorTo(stdout, 0)
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
    socket.once('data', resolve)
  })
}

function timedOut() {
  console.error('\nConnection to server timed out')
  exit(1)
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
