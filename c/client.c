// Author: github.com/trustytrojan
// TCP Chat Client in C

#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <json-c/json.h>
#include <signal.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <unistd.h>

#include "utils.c"

int my_socket;

void msg_listener_thread() {
  char buffer[1024];
  while(1) {
    int buf_size = read(my_socket, buffer, 1024);
    puts(buffer);
  }
}

static void sigint_handler() {
  // send(my_socket, "\004", 1, 0); // send EOT (end of transmission) byte
  close(my_socket);
  exit(0);
}

void register_sigint_handler() {
  struct sigaction sigterm_action;
  memset(&sigterm_action, 0, sizeof(sigterm_action));
  sigterm_action.sa_handler = sigint_handler;
  sigterm_action.sa_flags = 0;

  // Mask other signals from interrupting SIGINT handler
  if(sigfillset(&sigterm_action.sa_mask) != 0)
    error_and_exit("sigfillset");

  // Register SIGINT handler
  if(sigaction(SIGINT, &sigterm_action, NULL) != 0)
    error_and_exit("sigaction");
}

int main() {
  // Connect to chat server
  my_socket = connect_to_server("127.0.0.1", 8080);

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
    send(my_socket, input, len, 0);
  }
}
