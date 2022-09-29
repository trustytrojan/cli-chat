const { Server } = require('net')
const is_json = require('./is-json')

const port = 8080

const addr_socket = new Map()

// const username_socket = new Map()
// this map is for use with whispers/private messages

const server = new Server((socket) => {
  socket.addr = `${socket.remoteAddress}:${socket.remotePort}`
  console.log(`[${socket.addr}] has connected`)
  addr_socket.set(socket.addr, socket)

  socket.on('data', (data) => {
    const str = data.toString()
    console.log(`Incoming data from [${socket.addr}]: \`${str}\``)
    try {
      const obj = JSON.parse(str)
      switch(obj.type) {
        case 'setup':
          socket.username = obj.username
          welcome(socket)
          break
      }
      return
    } finally {
      send_all(`${str}`)
    }
  })

  socket.on('end', () => {
    console.log(`[${socket.addr}] has disconnected.`)
    goodbye(socket)
    disconnect_client(socket)
  })

  socket.on('error', (err) => {
    console.error(`Error involving client ${socket.addr}!`)
    console.error(err)
    disconnect_client(socket)
  })
})

process.on('SIGINT', close)

server.listen(port)

console.log(`Server started on port ${port}`)

function disconnect_client(socket) {
  addr_socket.delete(socket.addr)
  socket.destroy()
  console.log(`Destroyed connection with [${socket.addr}]`)
}

function welcome(socket) {
  send_all(`<Server:Welcome> [${socket.username}] has connected to the server. Say hi!`)
}

function goodbye(socket) {
  send_all(`<Server:Goodbye> [${socket.username}] has disconnected :(`)
}

function send_all(str) {
  for(const socket of addr_socket.values())
    socket.write(str)
}

function close() {
  for(const socket of addr_socket.values()) {
    socket.write(`<Server:Shutdown> This server is shutting down. You will be disconnected.`)
    socket.end()
  }
  server.close()
  process.exit(0)
}