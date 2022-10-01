# Author: github.com/trustytrojan
# TCP Chat Client in Python

from operator import itemgetter
from socket import socket
from sys import stdout

from config_selector import *
from utils import *

my_socket = socket()

# Chat prompt
prompt = '> '

if __name__ == '__main__':
  # Get desired config from config file
  host, port, username = itemgetter('host', 'port', 'username')(config_selector())

  # Connect to server
  my_socket.connect((host, port))

  # Start listener thread
  start_listener_thread(my_socket, prompt)

  # Send JSON to configure client details with the server
  ## Currently only needs to send the client's username
  send_setup_json(my_socket, username)

  # Input loop
  while True:
    msg = input(prompt)
    stdout.write('\x1B[1A\r\x1B[2K')
    if len(msg) == 0: continue
    send_msg(my_socket, msg)
