// Author: github.com/trustytrojan
// TCP Chat Server in JavaScript
const colored = require('colored.js')
const { Server, Socket } = require('net')
const { stdout, exit } = process

const port = 8080

// map sockets by address
const addr_socket = new Map()

// map sockets by the client's username (for use with whispers/private messages)
// const username_socket = new Map()

// reduce server overhead by creating colored strings beforehand
const colored_str = {
  opened: colored.green.bold('<Server:Opened>'),
  connection: colored.green.bold('<Server:Connection>'),
  disconnection: colored.bright_black.bold('<Server:Disconnection>'),
  client_error: colored.bright_black.bold('<Server:ClientError>'),
  incoming_data: colored.cyan.bold('<Server:IncomingData>'),
  welcome: colored.green.bold('<Server:Welcome>'),
  goodbye: colored.bright_black.bold('<Server:Goodbye>'),
  shutdown: colored.red.bold('<Server:Shutdown>'),
  closed: colored.red.bold('<Server:Closed>')
}

const server = new Server((socket) => {
  socket.addr = `${socket.remoteAddress}:${socket.remotePort}`
  console.log(`${colored_str.opened} [${socket.addr}] has connected`)
  addr_socket.set(socket.addr, socket)

  socket.on('data', (data) => {
    const str = data.toString()
    console.log(`${colored_str.incoming_data} [From ${socket.addr}] "${str}"`)
    try {
      const obj = JSON.parse(str)
      switch(obj.type) {
        case 'setup':
          socket.username = obj.username
          send_all(`${colored_str.welcome} ${colored.bold(`[${socket.username}]`)} has connected to the server. Say hi!`)
          break
        case 'command':
          // re-implement eventually
      }
    } catch(err) { // if incoming data is not json, it is assumed to be a normal message
      send_all(`${colored.bold(`[${socket.username}]`)} ${str}`)
    }
  })

  socket.on('end', () => {
    console.log(`${colored_str.disconnection} [${socket.addr}] has disconnected`)
    close_socket(socket)
  })

  socket.on('error', (err) => {
    console.error(`${colored_str.client_error} [Involving ${socket.addr}]`)
    console.error(err)
    close_socket(socket)
  })
})

process.on('SIGINT', close_server)

server.listen(port)

console.log(`${colored_str.opened} Listening on port ${colored.bold(port.toString())}`)

/** @param {Socket} socket */
function close_socket(socket) {
  addr_socket.delete(socket.addr)
  socket.end()
  socket.destroy()
  console.log(`Destroyed socket for [${socket.addr}]`)
  send_all(`${colored_str.goodbye} ${colored.bold(`[${socket.username}]`)} has disconnected :(`)
}

/** @param {string} str */
function send_all(str) {
  for(const socket of addr_socket.values())
    socket.write(str)
}

function close_server() {
  stdout.write('\n')
  for(const socket of addr_socket.values()) {
    socket.write(`${colored_str.shutdown} This server has shut down.`)
    socket.write('\x04');
    socket.end()
    socket.destroy()
  }
  server.close()
  console.log(`${colored_str.closed} Server has now closed. Exiting.`)
  exit(0)
}