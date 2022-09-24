const { Server } = require('net')

const port = 8080

const server = new Server()

const clients = new Map()

server.on('connection', (socket) => {
  const address = `${socket.remoteAddress}:${socket.remotePort}`
  announce(`Client at ${address} connected`)
  clients.set(address, socket)

  socket.on('data', (data) => {
    const message = data.toString()
    console.log(`[${address}] ${message}`)
    for(const client of clients.values())
      client.write(`[${address}] ${message}`)
  })

  socket.on('end', () => console.log(`Client at ${address} disconnected`))

  socket.on('error', (err) => {
    console.error(`Error involving client ${address}!`)
    console.error(err)
  })
})

server.listen(port)

console.log(`Listening on ${port}`)

function announce(message) {
  const announcement = `<Server> ${message}`
  console.log(announcement)
  for(const client of clients.values())
    client.write(announcement)
}
