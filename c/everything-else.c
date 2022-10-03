// Author: github.com/trustytrojan

#include "everything-else.h"

void client_log(const char* msg) {
  printf("<Client:Log> %s\n", msg);
}

void disconnected_from_server() {
  printf("\r");
  fflush(stdout);
  client_log("You were disconnected from the server.");
  client_log("Exiting.");
  exit(0);
}

void error_and_exit(const char* msg) {
  fprintf(stderr, "%s\n", msg);
  exit(1);
}

void register_sigint_handler(void (*handler)(int)) {
  struct sigaction sigterm_action;
  memset(&sigterm_action, 0, sizeof(sigterm_action));
  sigterm_action.sa_handler = handler;
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
