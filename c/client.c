#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <arpa/inet.h>
#include <sys/socket.h>
#include <unistd.h>
#include <json-c/json.h>

const char* wrap_msg_in_json(const char* msg) {
  json_object* root = json_object_new_object();
  json_object_object_add(root, "type", json_object_new_string("message"));
  json_object_object_add(root, "message", json_object_new_string(msg));
  return json_object_to_json_string_ext(root, JSON_C_TO_STRING_PLAIN);
}

int connect_to_server(const char* HOST, const int PORT, const char* USERNAME) {
  int _socket; // socket file descriptor to be returned

  // server address struct - stores address and port
  struct sockaddr_in serv_addr;

  // Create socket
  if((_socket = socket(AF_INET, SOCK_STREAM, 0)) < 0) {
    fprintf(stderr, "Socket creation error\n");
    return -1;
  }

  // set address family
  serv_addr.sin_family = AF_INET;

  // convert port to network byte order
  serv_addr.sin_port = htons(PORT);

  // Convert IP addresses from text to binary form
  if(inet_pton(AF_INET, HOST, &serv_addr.sin_addr) <= 0) {
    fprintf(stderr, "Invalid address\n");
    return -1;
  }

  // Connect to server and get file descriptor
  if(connect(_socket, (struct sockaddr*)&serv_addr, sizeof(serv_addr)) < 0) {
    fprintf(stderr, "Connection failed\n");
    return -1;
  }

  return _socket;
}

void send_setup_msg(int _socket) {
  const char* setup_msg = "{ \"type\": \"setup\", \"username\": \"client-c\" }";
  send(_socket, setup_msg, strlen(setup_msg), 0);
}

int my_socket;

void msg_listener_thread() {
  char buffer[1024];
  while(1) {
    int buf_size = read(my_socket, buffer, 1024);
    puts(buffer);
  }
}

int main() {
  my_socket = connect_to_server("127.0.0.1", 8080, "client-c");

  send_setup_msg(my_socket);

  // Buffer to store user input
  char input[1024];

  // User input loop
  while(1) {
    printf("> ");
    fgets(input, 1024, stdin);
    size_t len = strlen(input);
    if(len == 0) continue;
    input[len-1] = 0;
    const char* json_msg = wrap_msg_in_json(input);
    send(my_socket, json_msg, strlen(json_msg), 0);
  }

  close(my_socket);
}