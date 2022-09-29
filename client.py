from operator import itemgetter
from socket import socket
from threading import Thread
from sys import stdout
from json import JSONEncoder, JSONDecoder

my_socket = socket()
config_filename = './cli-chat-config.json'

def config_choices(configs):
  num_choices = 1
  choices_str = ''
  for config in configs:
    choices_str += f'\n{num_choices}. Server: [{config["host"]}:{config["port"]}], Username: [{config["username"]}]'
    num_choices += 1
  return (num_choices, choices_str)

def config_selector():
  configs = JSONDecoder().decode(open(config_filename, 'r').read())
  num_choices, choices_str = config_choices(configs)
  prompt = f'\nChoose server configuration: (1-{num_choices}) [1] '
  config = None
  while config is None:
    print(choices_str)
    selection = input(prompt)
    selection = 0 if (len(selection) == 0) else (int(selection)-1)
    selection = selection if (selection in range(0, num_choices)) else 0
    config = configs[selection]
  return config

def listen_for_messages():
  while True:
    message = my_socket.recv(1024).decode()
    stdout.write('\r\x1B[2K'+message+'\n'+prompt)

def send_json(obj):
  my_socket.send(bytes(JSONEncoder().encode(obj), 'utf-8'))

if __name__ == '__main__':
  host, port, username = itemgetter('host', 'port', 'username')(config_selector())

  prompt = '> '

  my_socket.connect((host, port))

  listener = Thread(target=listen_for_messages)
  listener.daemon = True
  listener.start()

  # Send setup object
  ## Currently only contains the client's username
  send_json({ 'type': 'setup', 'username': username })

  # Input loop
  while True:
    msg = input(prompt)
    stdout.write('\x1B[1A\r\x1B[2K')
    if len(msg) == 0: continue
    send_json({ 'type': 'message', 'message': msg })
