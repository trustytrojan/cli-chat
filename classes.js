const { Server, Socket } = require('net');

class ChatServer extends Server {
  constructor(port) {
    this.port = port
    this.clients = new Map()
  }
  start() {
    this.listen(this.port)
  }
}

class ChatClient extends Socket {

}