from json import JSONEncoder
from sys import stdout
from threading import Thread

def send_setup(socket, username):
  socket.send(bytes(JSONEncoder().encode({ 'type': 'setup', 'username': username }), 'utf-8'))

def send_msg(socket, msg):
  socket.send(bytes(JSONEncoder().encode({ 'type': 'message', 'message': msg }), 'utf-8'))

def start_listener_thread(socket, prompt):
  def msg_listener_thread():
    while True:
      message = socket.recv(1024).decode()
      stdout.write('\r\x1B[2K'+message+'\n'+prompt)
  
  listener = Thread(target=msg_listener_thread)
  listener.daemon = True
  listener.start()
