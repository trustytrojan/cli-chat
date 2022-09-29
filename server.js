const { Server } = require('net')
const colored = require('colored.js')

const port = 8080

const addr_socket = new Map()

// const username_socket = new Map()
// this map is for use with whispers/private messages

const server = new Server((socket) => {
  socket.addr = `${socket.remoteAddress}:${socket.remotePort}`
  console.log(`[${socket.addr}] has connected`)
  addr_socket.set(socket.addr, socket)

  socket.on('data', (data) => {
    const obj = JSON.parse(data.toString())
    console.log(`Incoming data from [${socket.addr}]:`, obj)
    switch(obj.type) {
      case 'setup':
        socket.username = obj.username
        welcome(socket)
        break
      case 'message':
        send_all(`${colored.bold(`[${socket.username}]`)} ${obj.message}`)
        break
    }
  })

  socket.on('end', () => {
    console.log(`[${socket.addr}] has disconnected.`)
    goodbye(socket)
    destroy_socket(socket)
  })

  socket.on('error', (err) => {
    console.error(`Error involving client ${socket.addr}!`)
    console.error(err)
    destroy_socket(socket)
  })
})

process.on('SIGINT', close)

server.listen(port)

console.log(`Server started on port ${port}`)

function destroy_socket(socket) {
  addr_socket.delete(socket.addr)
  socket.destroy()
  console.log(`Destroyed connection with [${socket.addr}]`)
}

function welcome(socket) {
  send_all(`${colored.green.bold('<Server:Welcome>')} [${socket.username}] has connected to the server. Say hi!`)
}

function goodbye(socket) {
  send_all(`${colored.green.dim('<Server:Goodbye>')} [${socket.username}] has disconnected :(`)
}

function send_all(str) {
  for(const socket of addr_socket.values())
    socket.write(str)
}

function close() {
  for(const socket of addr_socket.values()) {
    socket.write(`${colored.red.bold('<Server:Shutdown>')} This server has shut down.`)
    socket.end()
  }
  server.close()
  process.exit(0)
}