const { Socket } = require('net')
const { stdout, exit } = process
const { readline, rl, input } = require('./input')
const colored = require('colored.js')

function reset_cursor() {
  readline.moveCursor(stdout, 0, -1)
  readline.clearLine(stdout, 0)
  readline.cursorTo(stdout, 0)
}

function timed_out() {
  client_error('Connection to server timed out')
  exit(1)
}

function client_log(x) { console.log(`${colored.bold('<Client:Log>')} ${x}`) }
function client_error(x) { console.error(`${colored.red.bold('<Client:Error>')} ${x}`) }

Socket.prototype.send_json = function(obj) { this.write(JSON.stringify(obj)) }

async function main() {
  const { host, port, username } = await require('./client-config-selector')()

  client_log(`Current configuration:`)
  client_log(`Server IP: ${host}`)
  client_log(`Server port: ${port}`)
  client_log(`Username: ${username}`)
  {
    const answer = await input(`Continue connecting to server? [Yes] `)
    if(answer.length === 0 || answer === 'yes' || answer === 'y');
    else {
      console.log(`Exiting without saving.`)
      exit(0)
    }
  }
      
  const socket = new Socket()
  
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
      const message = await input(`> `)
      reset_cursor()
      if(message.length === 0) continue
      socket.send_json({ type: 'message', message })
      // wait for a response before restoring the prompt
      await new Promise((resolve) => socket.once('data', resolve))
    }
  })
}

main()
