const { Server } = require('net')

const port = 8080

const clients = new Map()

setInterval(() => {
  for(const client of clients.values())
    client.write('\0')
}, 4_000)

const server = new Server((socket) => {
  const client = new ChatClient(socket)
  clients.set(client.address, client)
})

server.listen(port)

console.log(`Server started on port ${port}`)

function announce(message) {
  const announcement = `<Server> ${message}`
  console.log(announcement)
  for(const client of clients.values())
    client.write(announcement)
}

class ChatClient {
  commands = {
    help: () => {
      socket.write(`
{Whisper from <Server>} List of all commands below:
{Whisper from <Server>} /help\tDisplays this message
{Whisper from <Server>} /leave\tDisconnects from the server
{Whisper from <Server>} /name <new_name>\tChange your username to <new_name>`)
    },
    name: (args) => {
      const new_name = args.join(' ')
      announce(`[${this.name}] has changed their name to [${new_name}]`)
      this.name = new_name
    },
    whisper: (args) => {

    }
  }

  // Properties
  name;

  /**
   * Construct a ChatClient object.
   * @param {Socket} socket 
   */
  constructor(socket) {
    this.address = `${socket.remoteAddress}:${socket.remotePort}`

    socket.on('data', (data) => {
      const str = data.toString()
      console.log(`[${this.name}]@${this.address} ${str}`)
      if(str.startsWith('/')) {
        const args = str.split(' ')
        const command = this.commands[args.shift().slice(1)]
        if(!command) {
          
        }
        return
      }
      for(const client of clients.values())
        client.write(`[${this.name}] ${str}`)
    })

    socket.on('end', ChatClient.commands.on_leave)

    socket.on('error', (err) => {
      console.error(`Error involving client ${address}!`)
      console.error(err)
      socket.destroy()
      clients.delete(address)
      console.error(`Destroyed connection with ${address}`)
    })

    this.socket = socket
  }

  on_join(args) {
    const n = args[0] // MAKE THIS OBJECT ORIENTED
    this.name = n.substring(1+n.indexOf('"'), n.lastIndexOf('"'))
    announce(`[${this.name}] has connected to the server. Say hi!`)
  }

  on_leave() {
    announce(`[${this.name}] has disconnected :(`)
    clients.delete(address)
  },

  whisper(from, msg) {
    this.socket.write(`{Whisper from ${from}} ${msg}`)
  }
}
