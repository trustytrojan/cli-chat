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
#include <pthread.h>

void error_and_exit();
void* msg_listener_thread();
void sigint_handler();
void register_sigint_handler();
const char* wrap_msg_in_json();
void send_setup_json();
int connect_to_server();

int my_socket;
pthread_mutex_t lock;
char* prompt = "> "; // eventually will be customiable

int main() {
  // Connect to chat server, return socket file descriptor
  my_socket = connect_to_server("127.0.0.1", 8080);

  // Setup with chat server
  send_setup_json(my_socket);

  // Buffer to store user input
  char input[1024];

  // Register SIGINT handler
  signal(SIGINT, sigint_handler);

  // Initialize mutex
  if(pthread_mutex_init(&lock, NULL) != 0)
    error_and_exit("mutex initialization failed");

  // Create and start listener thread
  pthread_t listener;
  pthread_create(&listener, NULL, msg_listener_thread, NULL);
  
  // User input loop
  while(1) {
    pthread_mutex_lock(&lock);
    printf(prompt);
    pthread_mutex_unlock(&lock);
    fgets(input, 1024, stdin);
    size_t len = strlen(input);
    if(len == 1) continue;
    input[len-1] = 0;
    send(my_socket, input, len, 0);
  }

  pthread_join(listener, NULL);
  pthread_mutex_destroy(&lock);
}

void* msg_listener_thread(void* arg) {
  char buffer[1024];
  while(1) {
    int bytes = read(my_socket, buffer, 1024);
    buffer[bytes] = 0;
    pthread_mutex_lock(&lock);
    printf("\r\x1B[2K%s\n%s", buffer, prompt);
    pthread_mutex_unlock(&lock);
  }
}

void error_and_exit(const char* msg) {
  fprintf(stderr, "%s\n", msg);
  exit(1);
}

void sigint_handler() {
  close(my_socket);
  printf("\n");
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

const char* wrap_msg_in_json(const char* msg) { // (comments below are js equivalent)
  json_object* root = json_object_new_object(); // root = {}
  json_object_object_add(root, "type", json_object_new_string("message")); // root.type = 'message'
  json_object_object_add(root, "message", json_object_new_string(msg)); // root.message = msg
  return json_object_to_json_string_ext(root, JSON_C_TO_STRING_PLAIN); // return JSON.stringify(root)
}

void send_setup_json(int _socket) {
  const char* setup_msg = "{ \"type\": \"setup\", \"username\": \"client-c\" }";
  send(_socket, setup_msg, strlen(setup_msg), 0);
}

int connect_to_server(const char* HOST, const int PORT) {
  // socket file descriptor to be returned
  int _socket;

  // server address struct - stores address and port for connection
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

  // Connect socket to server
  if(connect(_socket, (struct sockaddr*)&serv_addr, sizeof(serv_addr)) < 0)
    error_and_exit("Connection failed");

  return _socket;
}
