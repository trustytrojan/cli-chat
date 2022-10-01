// Author: github.com/trustytrojan
// TCP Chat Client in C

#include "everything-else.h"

int my_socket;
char* prompt = "> ";
pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;

void* msg_listener_thread(void* arg) {
  char buffer[1024];
  while(1) {
    int len = read(my_socket, buffer, 1024);
    if(buffer[0] == '\x4') disconnected_from_server();
    buffer[len] = 0;
    pthread_mutex_lock(&lock);
    printf("\r\x1B[2K%s\n%s", buffer, prompt);
    fflush(stdout);
    pthread_mutex_unlock(&lock);
  }
}

void sigint_handler() {
  close(my_socket);
  printf("\n");
  exit(0);
}

int main() {
  // Connect to chat server, return socket file descriptor
  my_socket = connect_to_server("127.0.0.1", 8080);

  // Setup with chat server
  send_setup_json(my_socket);

  // Buffer to store user input
  char input[1024];

  // Register SIGINT handler
  register_sigint_handler(sigint_handler);

  // Create and start listener thread
  pthread_t listener;
  pthread_create(&listener, NULL, msg_listener_thread, NULL);
  
  // User input loop
  while(1) {
    printf(prompt);
    fflush(stdout);
    fgets(input, 1024, stdin);
    printf("\x1B[1A\r\x1b[2K");
    fflush(stdout);
    size_t len = strlen(input);
    if(len == 1) continue;
    input[len-1] = 0;
    send(my_socket, input, len, 0);
  }

  pthread_join(listener, NULL);
  pthread_mutex_destroy(&lock);
}
