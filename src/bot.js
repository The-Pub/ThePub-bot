import { Client } from 'discord.js'

import config from './config'
import commands from './commands'

const bot = new Client({
  messageCacheMaxSize: 500,
  messageCacheLifetime: 120,
  messageSweepInterval: 60,
})

bot.on('ready', () => {
  console.log(`Pronto! Como: ${bot.user.tag}!`)
})

bot.on('message', commands)

bot.login(config.BOT_KEY)
