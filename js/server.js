// Author: github.com/trustytrojan
// TCP Chat Server in JavaScript

const { Server, Socket } = require('net')
const colored = require('colored.js')
const { stdout, exit } = process

const port = 8080

// map sockets by address
const addr_socket = new Map()

// map sockets by the client's username (for use with whispers/private messages)
// const username_socket = new Map()

function server_incoming(addr, str) { console.log(`${colored.bright_cyan.bold('<Server:Incoming>')} [From ${addr}] "${str}"`) }
function server_outgoing(addr, str) { console.log(`${colored.bright_purple.bold('<Server:Outgoing>')} [To ${addr}] "${str}"`) }
function server_connection(addr) { console.log(`${colored.green.bold('<Server:Connection>')} [${addr}] has connected`) }
function server_disconnection(addr) { console.log(`${colored.green.bold('<Server:Disonnection>')} [${addr}] has connected`) }

const server = new Server((socket) => {
  socket.addr = `${socket.remoteAddress}:${socket.remotePort}`
  server_connection(socket.addr)
  addr_socket.set(socket.addr, socket)

  socket.on('data', (data) => {
    const str = data.toString()
    server_incoming(socket.addr, str)
    try {
      const obj = JSON.parse(str)
      switch(obj.type) {
        case 'setup':
          socket.username = obj.username
          send_all(`${colored.green.bold('<Server:Welcome>')} ${colored.bold(`[${socket.username}]`)} has connected to the server. Say hi!`)
          break
        case 'command':
          // re-implement eventually
      }
    } catch(err) { // if incoming data is not json, it is assumed to be a normal message
      send_all(`${colored.bold(`[${socket.username}]`)} ${str}`)
    }
  })

  socket.on('end', () => {
    server_disconnection(socket.addr)
    close_socket(socket)
  })

  socket.on('error', (err) => {
    console.error(`${colored.bright_black.bold('<Server:ClientError>')} [Involving ${socket.addr}]`)
    console.error(err)
    close_socket(socket)
  })
})

process.on('SIGINT', close_server)

server.listen(port)

console.log(`${colored.green.bold('<Server:Opened>')} Listening on port ${colored.bold(port.toString())}`)

/** @param {Socket} socket */
function close_socket(socket) {
  addr_socket.delete(socket.addr)
  socket.end()
  socket.destroy()
  console.log(`Destroyed socket for [${socket.addr}]`)
  send_all(`${colored.bright_black.bold('<Server:Goodbye>')} ${colored.bold(`[${socket.username}]`)} has disconnected :(`)
}

/** @param {string} str */
function send_all(str) {
  server_outgoing('All', str)
  for(const socket of addr_socket.values()) socket.write(str)
}

function close_server() {
  stdout.write('\n')
  send_all(`${colored.red.bold('<Server:Shutdown>')} This server has shut down.`)
  server.close()
  console.log(`${colored.red.bold('<Server:Closed>')} Server has now closed. Exiting.`)
  exit(0)
}