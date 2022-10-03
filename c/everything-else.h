// Author: github.com/trustytrojan

#ifndef everything_else_h
#define everything_else_h

#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <json-c/json.h>
#include <signal.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <pthread.h>

void client_log(const char* msg);

void disconnected_from_server();

void error_and_exit(const char* msg);

void sigint_handler();

void register_sigint_handler(void (*handler)(int));

const char* wrap_msg_in_json(const char* msg);

void send_setup_json(int _socket);

int connect_to_server(const char* HOST, const int PORT);

#endif
