using System;
using System.Threading;
using System.Net;
using System.Net.Sockets;
using System.Text;

static class client {
  const string HOST = "localhost";
  const int PORT = 8080;
  const string USERNAME = "client-cs";
  const string prompt = "\033[2;90m["+USERNAME+"] \033[0;39m";
  const Mutex _lock = new Mutex();

  class setup_obj {
    public string type { get; set; }
    public string username { get; set; }
  }

  static void Main(string[] Args) {
    // Create socket and cnnect to server
    IPAddress ip_address = Dns.GetHostEntry(HOST).AddressList[0];
    Socket socket = new Socket(ip_address.AddressFamily, SocketType.Stream, ProtocolType.Tcp);
    socket.Connect(new IPEndPoint(ip_address, PORT));

    socket.Send(Encoding.UTF8.GetBytes(JsonSerializer.Serialize(new setup_obj{ type = "setup", username = USERNAME })));

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
        int num_bytes = socket.Receive(buffer);
        // _lock.WaitOne();
        if(buffer[0] == (byte)('\x4')) {
          Console.Write('\r');
          Console.WriteLine("You were disconnected from the server. Exiting.");
          disconnected_from_server();
        }
        // Console.Write("\r\x1B[2K{0}\n{1}", Encoding.UTF8.GetString(buffer, 0, num_bytes), prompt);
        // _lock.ReleaseMutex();
      }
    }));
    listener.Start();

    // User input loop
    while(true) {
      _lock.WaitOne();
      Console.Write("> ");
      string? input = Console.ReadLine();
      // Console.Write("\x1B[1A\r\x1b[2K");
      _lock.ReleaseMutex();
      if(input == null || input.Length == 0) continue;
      socket.Send(Encoding.UTF8.GetBytes(input));
    }
  }
}
