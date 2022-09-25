const { Server } = require('net')

const port = 8080

const clients = new Map()

const server = new Server((socket) => {
  const address = `${socket.remoteAddress}:${socket.remotePort}`
  let name

  clients.set(address, socket)

  setInterval(() => {
    for(const client of clients.values())
      client.write('heartbeat')
  }, 4_000)

  socket.on('data', (data) => {
    const str = data.toString()
    if(str.startsWith('name="')) {
      name = str.substring(1+str.indexOf('"'), str.lastIndexOf('"'))
      announce(`[${name}] has connected to the server. Say hi!`)
      return
    }
    if(str.startsWith('new_name="')) {
      const new_name = str.substring(1+str.indexOf('"'), str.lastIndexOf('"'))
      announce(`[${name}] has changed their name to [${new_name}]`)
      name = new_name
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
    console.error(`Error involving client [${name}]@${address}!`)
    console.error(err)
  })
})

server.listen(port)

console.log(`Server started on port ${port}`)

function announce(message) {
  const announcement = `<Server> ${message}`
  console.log(announcement)
  for(const client of clients.values())
    client.write(announcement)
}
