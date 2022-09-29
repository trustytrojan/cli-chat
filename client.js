const { Socket } = require('net')
const readline = require('readline')
// const { existsSync, writeFileSync } = require('fs')
const { stdin, stdout, exit, argv } = process

if(argv.length < 5) {
  console.log(
`Usage: <program_name> <ip> <port> <username>      
    <ip>           Server IP address
    <port>         Server port
    <username>     Your username to be used in chat`)
  exit(1)
}

const host = argv[2]
const port = Number.parseInt(argv[3])
let username = argv[4]
const server_address = `${host}:${port}`

client_log(`Current configuration:`)
client_log(`Server IP: ${host}`)
client_log(`Server port: ${port}`)
client_log(`Username: ${username}`)
{
  const x = prompt(`Continue connecting to server? (Y/n) `)
  if(!x || x.toLowerCase() === 'y');
  else exit(0)
}


// add known_servers.json file parsing

const rl = readline.createInterface({
  input: stdin,
  output: stdout
})

const socket = new Socket()

socket.on('error', (err) => {
  console.error(err)
  console.error(`\nThe error above occurred when connecting to the server.\nPlease make sure you have entered the correct address and port in the config file.`)
  exit(1)
})

socket.on('data', (data) => {
  const str = data.toString()
  rl.pause()
  stdout.write('\n')
  reset_cursor()
  stdout.write(str+'\n'+rl.getPrompt()+rl.line)
  rl.resume()
})

client_log(`Press Ctrl+C to disconnect.`)
client_log(`Connecting to server at ${server_address}`)
let connection_timeout = setTimeout(timed_out, 5_000)

socket.connect(port, host, async () => {
  clearTimeout(connection_timeout)
  socket.write(JSON.stringify({ type: 'setup', username }))
  client_log(`You're connected. Say hi!`)
  while(true) {
    const str = await prompt(`> `)
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
  client_error('Connection to server timed out')
  exit(1)
}

/**
 * Mimicking Python's input().
 * @param {string} query 
 * @returns {string}
 */
async function prompt(query) {
  return new Promise(resolve => rl.question(query, (answer) => resolve(answer)))
}

function client_log(x) { console.log(`<Client:Log> ${x}`) }
function client_error(x) { console.error(`<Client:Error> ${x}`) }
