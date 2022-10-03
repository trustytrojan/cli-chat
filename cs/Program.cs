using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;

class Program {
  const string HOST = "localhost";
  const int PORT = 8080;

  public static void Main(string[] args) {

  }

  static void 
}



// Create socket and cnnect to server
IPAddress ip_address = Dns.GetHostEntry(HOST).AddressList[0];
Socket socket = new Socket(ip_address.AddressFamily, SocketType.Stream, ProtocolType.Tcp);
socket.Connect(new IPEndPoint(ip_address, PORT));

Func<int> disconnected_from_server = () => {
  socket.Disconnect(false);
  socket.Dispose();
  System.Environment.Exit(0);
  return 0;
};

// Register Ctrl+C handler
Console.CancelKeyPress += (sender, args) => {
  Console.WriteLine("Ctrl+C pressed. Disconnecting from server and exiting.");
  disconnected_from_server();
};

// Create and start listener thread
Thread listener = new Thread(new ThreadStart(() => {
  byte[] buffer = new byte[1024];
  while(true) {
    socket.Receive(buffer);
    if(buffer[0] == (byte)('\x4')) {
      Console.Write('\r');
      Console.WriteLine("You were disconnected from the server. Exiting.");
      disconnected_from_server();
    }
    Console.WriteLine()
  }
}));
listener.Start();

// User input loop
while(true) {
  Console.Write("> ");
  string? input = Console.ReadLine();
  if(input is null || input.Length == 0) continue;
  socket.Send(Encoding.UTF8.GetBytes(input));
}
