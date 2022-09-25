from socket import socket
from sys import argv

if len(argv) < 4:
  print(f'Usage: {argv[0]} <ip> <port> <username>')
  print('    <ip>           Server IP address')
  print('    <port>         Server port')
  print('    <username>     Your username to be used in chat')
  exit(0)

my_socket = socket()

my_socket.connect((argv[1], int(argv[2])))

my_socket.send(bytes(f'name="{argv[3]}"', 'utf-8'))

while(True):
  msg = input('> ')
  my_socket.send(bytes(msg, 'utf-8'))
