const { Socket } = require('net')
const readline = require('readline')
// const { existsSync, writeFileSync } = require('fs')
const { stdin, stdout, exit, argv } = process

if(argv.length < 5) {
  console.log(`Usage: <program_name> <ip> <port> <username>      
    <ip>           Server IP address
    <port>         Server port
    <username>     Your username to be used in chat`)
  process.exit(0)
}

const host = argv[2]
const port = Number.parseInt(argv[3])
let username = argv[4]
const server_address = `${host}:${port}`

// add known_servers.json file parsing

const rl = readline.createInterface({
  input: stdin,
  output: stdout
})

const socket = new Socket()

const timeout_time = 5_000
let timeout

socket.on('error', (err) => {
  console.error(err)
  console.error(`\nThe error above occurred when connecting to the server.\nPlease make sure you have entered the correct address and port in the config file.`)
  exit(1)
})

socket.on('data', (data) => {
  clearTimeout(timeout)
  timeout = setTimeout(timed_out, timeout_time)
  const str = data.toString()
  if(str === '\0') return
  rl.pause()
  stdout.write('\n')
  reset_cursor()
  console.log(str)
  stdout.write(rl.getPrompt())
  rl.resume()
})

console.log(`<Client> Press Ctrl+C to disconnect.`)
console.log(`<Client> Connecting to server at ${server_address}`)
timeout = setTimeout(timed_out, 5_000)

socket.connect(port, host, async () => {
  clearTimeout(timeout)
  socket.write(JSON.stringify({ type: 'setup', username }))
  console.log(`<Client> You're connected. Say hi!`)
  while(true) {
    const str = await prompt(`[${username}]> `)
    reset_cursor()
    if(str.length === 0) continue
    socket.write(str)
    await new Promise((resolve) => socket.once('data', resolve))
  }
})

function reset_cursor() {
  readline.moveCursor(stdout, 0, -1)
  readline.clearLine(stdout, 0)
  readline.cursorTo(stdout, 0)
}

function timed_out() {
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

  return new Promise(resolve => rl.question(query, (answer) => resolve(answer)))
}
