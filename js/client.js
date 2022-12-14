// Author: github.com/trustytrojan
// TCP Chat Client in JavaScript

const { Socket } = require('net')
const { stdout, exit } = process
const { readline, rl, input } = require('./input')
const colored = require('colored.js')

function reset_cursor() {
  readline.moveCursor(stdout, 0, -1) // \x1B[1A
  readline.cursorTo(stdout, 0) // \r
  readline.clearLine(stdout, 0) // \x1B[2K
}

function timed_out() {
  client_error('Connection to server timed out')
  exit(1)
}

function client_log(x) { console.log(`${colored.blue.bold('<Client:Log>')} ${x}`) }
function client_error(x) { console.error(`${colored.red.bold('<Client:Error>')} ${x}`) }
async function client_input(x) { return await input(`${colored.purple.bold('<Client:Input>')} ${x}`) }

Socket.prototype.send_json = function(obj) { this.write(JSON.stringify(obj)) }

async function main() {
  // run configuration selector
  const { host, port, username } = await require('./config-selector')()

  // display chosen configuration to user
  client_log(`Current configuration:`)
  client_log(`Server IP: ${host}`)
  client_log(`Server port: ${port}`)
  client_log(`Username: ${username}`)

  /* confirm with user to connect */ {
    const answer = await client_input('Continue connecting to server? [Yes] ')
    if(!(answer.length === 0 || answer === 'yes' || answer === 'y')) {
      client_log(`Exiting.`)
      exit(0)
    }
  }
      
  const socket = new Socket()

  socket.on('end', () => {
    client_log('You were disconnected from the server.')
    client_log('Now exiting.')
    exit(0)
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
  client_log(`Connecting to server at ${host}:${port}`)
  let timeout = setTimeout(timed_out, 5_000)
  
  socket.connect(port, host, async () => {
    clearTimeout(timeout)
    socket.send_json({ type: 'setup', username })
    client_log(`You're connected. Say hi!`)
    while(true) {
      const _s = await input(`${colored.dim(`[${username}]`)} `)
      reset_cursor()
      if(_s.length === 0) continue
      if(_s.startsWith('/'))
        parse_command(_s)
      socket.write(_s)
      // wait for a response before restoring the prompt
      await new Promise((resolve) => socket.once('data', resolve))
    }
  })
}

main()
