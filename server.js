const { Server } = require('net')

const port = 8080

const server = new Server()

const clients = new Map()

server.on('connection', (socket) => {
  const address = `${socket.remoteAddress}:${socket.remotePort}`
  let name

  clients.set(address, socket)

  socket.on('data', (data) => {
    const str = data.toString()
    if(str.startsWith('name=')) {
      name = str.substring(1+str.indexOf('"'), str.lastIndexOf('"'))
      announce(`[${name}] connected to the server. Say hi!`)
      return
    }
    console.log(`[${name}]@${address} ${str}`)
    for(const client of clients.values())
      client.write(`[${name}] ${str}`)
  })

  socket.on('end', () => {
    announce(`[${name}] has disconnected :(`)
    clients.delete(address)
  })

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
