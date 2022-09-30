#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <json-c/json.h>
#include <signal.h>
#include <sys/socket.h>
#include <arpa/inet.h>

int my_socket;

void msg_listener_thread() {
  char buffer[1024];
  while(1) {
    int buf_size = read(my_socket, buffer, 1024);
    puts(buffer);
  }
}

static void sigint_handler() {
  close(my_socket);
  exit(0);
}

int main() {
  // Connect to chat server
  my_socket = connect_to_server("127.0.0.1", 8080, "client-c");

  // Setup with chat server
  send_setup_msg(my_socket);

  // Buffer to store user input
  char input[1024];

  signal(SIGINT, sigint_handler);

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
}