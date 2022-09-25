const { Server, Socket } = require('net')

const port = 8080

const addr_socket = new Map()
const username_socket = new Map()

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
    if(str.startsWith('/')) {
      const args = str.split(' ')
      const command = commands[args.shift().slice(1)]
      if(!command) {
        socket.write(`{Whisper from <Server>} Unknown command. Send "/help" to see all available commands.`)
        return
      }
      command(args)
      return
    }
    send_all(`[${socket.username}] ${str}`)
  })

  const commands = {
    on_join([ username ]) {
      if(!/^username="(.+)"$/.test(username)) {
        whisper_stoc(socket, 'Your username field is empty. You will be disconnected. Please reconnect with a proper username.')
        disconnect_client(socket)
        return
      }
      socket.username = username.substring(1+username.indexOf('"'), username.lastIndexOf('"'))
      username_socket.set(socket.username, socket)
      welcome(socket.username)
    },
    on_leave() {
      announce(`[${socket.username}] has disconnected :(`)
      disconnect_client(socket)
    },
    help() {
      whisper_stoc(socket, 'List of all commands below (type without quotes):')
      whisper_stoc(socket, '"/help" Displays this message.')
      whisper_stoc(socket, '"/ch_name <new_name>" Changes your username to <new_name>.')
      whisper_stoc(socket, '"/whisper <[username]> <message>" Send a private message.')
    },
    ch_name([ new_username ]) {
      if(!new_username) {
        whisper_stoc(socket, 'Incorrect usage of "/ch_name".')
        whisper_stoc(socket, 'Usage: /ch_name <new_username>')
        return
      }
      announce(`[${socket.username}] has changed their name to [${new_username}]`)
      username_socket.delete(socket.username)
      socket.username = new_username
      username_socket.set(socket.username, socket)
    },
    whisper([ recipient_name, ...message ]) {
      function usage() {
        whisper_stoc(socket, 'whisper: Incorrect usage.')
        whisper_stoc(socket, 'whisper: Usage: /whisper <username> <message>')
      }
      if(!recipient_name) { usage(); return }
      message = message.join(' ')
      if(message.length === 0) { usage(); return }
      const recipient_sock = username_socket.get(recipient_name)
      if(!recipient_sock) {
        whisper_stoc(socket, 'whisper: The specified user does not exist in this server.')
        return
      }
      whisper_ctoc(socket, recipient_sock, message)
    }
  }

  socket.on('end', commands.on_leave)

  socket.on('error', (err) => {
    console.error(`Error involving client ${socket.addr}!`)
    console.error(err)
    socket.destroy()
    commands.on_leave()
  })
})

process.on('SIGINT', close)

server.listen(port)

console.log(`Server started on port ${port}`)

/**
 * Whisper a message from the server to a client.
 * @param {Socket} socket 
 * @param {string} msg 
 */
function whisper_stoc(socket, msg) {
  socket.write(`{From <Server>} ${msg}`)
}

/**
 * Pass a whisper message to its recipient
 * @param {Socket} sock_from 
 * @param {Socket} sock_to 
 * @param {string} msg 
 */
function whisper_ctoc(sock_from, sock_to, msg) {
  sock_from.write(`{To [${sock_to.username}]} ${msg}`)
  sock_to.write(`{From [${sock_from.username}]} ${msg}`)
}

function disconnect_client(socket) {
  console.log(`Destroyed connection with [${socket.addr}]`)
  addr_socket.delete(socket.addr)
  username_socket.delete(socket.username)
  socket.destroy()
}

function welcome(name) {
  send_all(`<Server:Welcome> [${name}] has connected to the server. Say hi!`)
}

function announce(message) {
  send_all(`<Server:Announcement> ${message}`)
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
