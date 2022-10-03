// Author: github.com/trustytrojan
// .NET 7 Implementation

using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Text.Json;

static class Client {
  // Eventually code a config selector for these parameters
  const string HOST = "localhost";
  const int PORT = 8080;
  const string USERNAME = "client-cs";
  const string prompt = "\x1B[2;90m["+USERNAME+"] \x1B[0;39m";

  readonly static IPAddress ip_address = Dns.GetHostEntry(HOST).AddressList[0];
  readonly static Socket socket = new Socket(ip_address.AddressFamily, SocketType.Stream, ProtocolType.Tcp);

  class setup_obj {
    const string type = "setup";
    public string? username { get; set; }
  }

  static void send_setup_obj() {
    setup_obj setup = new setup_obj{
      username = USERNAME
    };
    string setup_json = JsonSerializer.Serialize(setup);
    byte[] setup_json_bytes = Encoding.UTF8.GetBytes(setup_json);
    socket.Send(setup_json_bytes);
  }

  static void disconnect() {
    socket.Disconnect(false);
    socket.Dispose();
    System.Environment.Exit(0);
  }

  static void Main(string[] Args) {
    // Create socket and cnnect to server
    socket.Connect(new IPEndPoint(ip_address, PORT));

    // Send setup JSON object to server.
    // This will:
    // - Configure the client's username
    // - ...more to come
    send_setup_obj();

    // Register Ctrl+C handler
    Console.CancelKeyPress += (sender, args) => {
      Console.WriteLine("\nCtrl+C pressed. Disconnecting from server and exiting.");
      disconnect();
    };

    Mutex mutex = new Mutex();

    // Create and start listener thread
    Thread listener = new Thread(new ThreadStart(() => {
      byte[] buffer = new byte[1024];
      while(true) {
        int num_bytes = socket.Receive(buffer);
        mutex.WaitOne();
        if(buffer[0] == (byte)'\x4') { // if the server sends an end of transmission (EOT) character, we must disconnect.
          Console.WriteLine("\rYou were disconnected from the server. Exiting.");
          disconnect();
        }
        Console.Write("\r\x1B[2K{0}\n{1}", Encoding.UTF8.GetString(buffer, 0, num_bytes), prompt);
        mutex.ReleaseMutex();
      }
    }));
    listener.Start();

    // User input loop
    while(true) {
      //mutex.WaitOne();
      Console.Write(prompt);
      string? input = Console.ReadLine();
      Console.Write("\x1B[1A\r\x1b[2K");
      //mutex.ReleaseMutex();
      if(input == null || input.Length == 0) continue;
      socket.Send(Encoding.UTF8.GetBytes(input));
    }
  }
}
