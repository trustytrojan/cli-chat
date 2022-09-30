// Author: github.com/trustytrojan

#include <stdio.h>
#include <string.h>
#include <json-c/json.h>
#include <arpa/inet.h>
#include <sys/socket.h>

void error_and_exit(const char* msg) {
  fprintf(stderr, "%s\n", msg);
  exit(1);
}

const char* wrap_msg_in_json(const char* msg) { // js equivalent
  json_object* root = json_object_new_object(); // root = {}
  json_object_object_add(root, "type", json_object_new_string("message")); // root.type = 'message'
  json_object_object_add(root, "message", json_object_new_string(msg)); // root.message = msg
  return json_object_to_json_string_ext(root, JSON_C_TO_STRING_PLAIN); // return JSON.stringify(root)
}

void send_setup_msg(int _socket) {
  const char* setup_msg = "{ \"type\": \"setup\", \"username\": \"client-c\" }";
  send(_socket, setup_msg, strlen(setup_msg), 0);
}

int connect_to_server(const char* HOST, const int PORT) {
  int _socket; // socket file descriptor to be returned

  // server address struct - stores address and port
  struct sockaddr_in serv_addr;

  // Create socket
  if((_socket = socket(AF_INET, SOCK_STREAM, 0)) < 0)
    error_and_exit("Socket creation error");

  // set address family
  serv_addr.sin_family = AF_INET;

  // convert port to network byte order
  serv_addr.sin_port = htons(PORT);

  // Convert IP addresses from text to binary form
  if(inet_pton(AF_INET, HOST, &serv_addr.sin_addr) <= 0) 
    error_and_exit("Invalid address");

  // Connect to server and get file descriptor
  if(connect(_socket, (struct sockaddr*)&serv_addr, sizeof(serv_addr)) < 0)
    error_and_exit("Connection failed");

  return _socket;
}
