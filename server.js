const { Server } = require('net')
const is_json = require('./is-json')

const port = 8080

const addr_socket = new Map()
const username_socket = new Map()

// prevent clients from timing out
setInterval(() => {
  for(const socket of addr_socket.values())
    socket.write('\0')
}, 4_000)

const server = new Server((socket) => {
  socket.addr = `${socket.remoteAddress}:${socket.remotePort}`
  console.log(`[${socket.addr}] has connected`)
  addr_socket.set(socket.addr, socket)

  socket.on('data', (data) => {
    const str = data.toString()
    console.log(`Incoming data from [${socket.addr}]: \`${str}\``)
    if(is_json(str)) {
      const obj = JSON.parse(str)
      switch(obj.type) {
        case 'setup':
          socket.username = obj.username
          welcome(socket)
          break
      }
      return
    }
    send_all(`[${socket.username}] ${str}`)
  })

  socket.on('end', () => {
    console.log(`[${socket.addr}] has disconnected.`)
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
  console.log(`Destroyed connection with [${socket.addr}]`)
  addr_socket.delete(socket.addr)
  username_socket.delete(socket.username)
  socket.destroy()
}

function welcome(socket) {
  send_all(`<Server:Welcome> [${socket.username}] has connected to the server. Say hi!`)
}

function send_all(str) {
  for(const socket of addr_socket.values())
    socket.write(str)
}

function close() {
  for(const socket of addr_socket.values()) {
    socket.write(`<Server:Shutdown> This server is shutting down. You will be disconnected.`)
    socket.destroy()
  }
  server.close()
  process.exit(0)
}
