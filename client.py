from socket import socket
from threading import Thread
from sys import argv, stdout
from json import JSONEncoder

my_socket = socket()

def listen_for_messages():
  while True:
    message = my_socket.recv(1024).decode()
    stdout.write('\r\x1B[2K'+message+'\n'+prompt)

def send_json(obj):
  my_socket.send(bytes(JSONEncoder().encode(obj), 'utf-8'))

if __name__ == '__main__':
  if len(argv) < 4:
    print(f'Usage: {argv[0]} <ip> <port> <username>')
    print('    <ip>           Server IP address')
    print('    <port>         Server port')
    print('    <username>     Your username to be used in chat')
    exit(1)

  prompt = '> '

  my_socket.connect((argv[1], int(argv[2])))
  send_json({ 'type': 'setup', 'username': argv[3] })
  print(my_socket.recv(1024).decode('utf-8'))

  listener = Thread(target=listen_for_messages)
  listener.daemon = True
  listener.start()

  while True:
    msg = input(prompt)
    stdout.write('\x1B[1A\r\x1B[2K')
    if len(msg) == 0: continue
    send_json({ 'type': 'message', 'message': msg })
