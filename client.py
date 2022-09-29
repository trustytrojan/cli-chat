from socket import socket
from threading import Thread
from sys import argv, stdout, stdin
from json import JSONEncoder

def listen_for_messages():
  while True:
    message = my_socket.recv(1024).decode()
    stdout.write('\r\x1B[2K'+message+'\n'+prompt)

if __name__ == '__main__':
  if len(argv) < 4:
    print(f'Usage: {argv[0]} <ip> <port> <username>')
    print('    <ip>           Server IP address')
    print('    <port>         Server port')
    print('    <username>     Your username to be used in chat')
    exit(1)

  prompt = f'[{argv[3]}]> '

  my_socket = socket()
  my_socket.connect((argv[1], int(argv[2])))
  my_socket.send(bytes(JSONEncoder().encode({ 'type': 'setup', 'username': argv[3] }), 'utf-8'))
  print(my_socket.recv(1024).decode('utf-8'))

  listener = Thread(target=listen_for_messages)
  listener.daemon = True
  listener.start()

  while True:
    msg = input(prompt)
    stdout.write('\x1B[1A\r\x1B[2K')
    if len(msg) == 0: continue
    my_socket.send(bytes(msg, 'utf-8'))
