# Author: github.com/trustytrojan

from json import JSONDecoder

config_filename = './cli-chat-config.json'

def config_choices(configs):
  num_choices = 1
  choices_str = ''
  for config in configs:
    choices_str += f'\n{num_choices}. Server: [{config["host"]}:{config["port"]}], Username: [{config["username"]}]'
    num_choices += 1
  choices_str += f'\n{num_choices}. Create new config'
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
