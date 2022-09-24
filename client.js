const { Socket } = require('net')
const readline = require('readline')

const host = 'localhost'
const port = 8080
const server_address = `${host}:${port}`
const msg_prompt = 'Send a message> '

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const client = new Socket()
const client_address = `${client.localAddress}:${client.localPort}`

client.on('data', (data) => {
  rl.pause()
  const message = data.toString()
  //if(!message.startsWith(client_address))
    process.stdout.write('\n')
  resetCursor()
  console.log(message)
  process.stdout.write(msg_prompt)
  rl.resume()
})

client.connect(port, host, async () => {
  console.log(`Connected to server at ${server_address}`)
  while(true) {
    const message = await prompt(msg_prompt)
    if(message.length === 0) {
      resetCursor()
      continue
    }
    resetCursor()
    //readline.clearLine(process.stdout, 0)
    client.write(message)
    await awaitData().catch(timedOut)
  }
})

function resetCursor() {
  readline.moveCursor(process.stdout, 0, -1)
  readline.clearLine(process.stdout, 0)
  readline.cursorTo(process.stdout, 0)
}

async function awaitData() {
  return new Promise((resolve, reject) => {
    setTimeout(reject, 5000)
    client.once('data', resolve)
  })
}

function timedOut() {
  console.log('Connection to server timed out')
  process.exit(1)
}

async function prompt(query) {
  if(typeof query !== 'string')
    throw TypeError()

  return new Promise(resolve => rl.question(query, ans => {
    resolve(ans)
  }))
}

function clearLine(n) {
  process.stdout.write('\r')
  for(let i = 0; i < n; ++i)
    process.stdout.write('\127')
}
