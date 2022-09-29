const { writeFileSync, existsSync } = require('fs')
const { input } = require('./input')
const colored = require('colored.js')

const config_filename = './cli-chat-config.json'

async function create_config() {
  console.log(colored.bold('\nCreating new config.'))
  let host = await input(`Enter server IP address: [localhost] `)
  if(host.length === 0) host = 'localhost'
  let port = await input(`Enter server port: [8080] `)
  if(port.length === 0) port = 8080
  else port = Number.parseInt(port)
  let username = await input(`Enter your username for this server: [client-js] `)
  if(username.length === 0) username = 'client-js'
  return { host, port, username }
}

function config_choices(configs) {
  let num_choices = 1
  let choices_str = ''
  for(const { host, port, username } of configs) {
    choices_str += `\n${colored.bold(`${num_choices++}.`)} ${host}:${port}, [${username}]`
  }
  choices_str += `\n${colored.bold(`${num_choices}.`)} Create new configuration`
  return { num_choices, choices_str }
}

module.exports = async function() {
  console.log(colored.bold('CLI Chat - Server Config Selector'))

  if(!existsSync(config_filename)) {
    console.log(`Let's create your first server configuration.`)
    const config = await create_config()
    console.log(config)
    console.log(`Above is your desired server configuration.`)
    const answer = (await input(`${colored.bold('Would you like to save it?')} [Yes] `)).toLowerCase()
    if(answer.length === 0 || answer === 'yes' || answer === 'y') {
      console.log(`Saving configuration...`)
      writeFileSync(config_filename, JSON.stringify([config], null, '  '))
    } else {
      console.log(`Exiting without saving.`)
      process.exit(0)
    }
  }

  const configs = require(config_filename)
  let { num_choices, choices_str } = config_choices(configs)
  const prompt = `\n${colored.bold('Choose server configuration:')} (1-${num_choices}) [1] `
  let config
  while(!config) {
    console.log(choices_str)
    const selection = +(await input(prompt))
    if(selection === num_choices) {
      configs.push(await create_config())
      console.log(`Saving configuration...`)
      writeFileSync(config_filename, JSON.stringify(configs, null, '  '))
      choices = config_choices(configs)
      continue
    }
    config = configs[selection]
  }

  return config
}
