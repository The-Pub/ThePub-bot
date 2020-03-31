import { Message } from 'discord.js'

import config from '../config'

import { tenor } from '../services/api'

/** @param {Message} message */
export default async function (message) {
  const { content } = message

  if (content === '.pum') {
    message.channel.send(`${message.author} soltou um pum!`, {
      tts: true,
    })
  }

  if (content.startsWith('.gif')) {
    try {
      const [_, ...query] = content.split(' ')

      const response = await tenor.get('/v1/search', {
        params: {
          key: config.TENOR_KEY,
          q: query.join(' '),
        },
      })

      const {
        data: { results },
      } = response

      if (results.length) {
        const gif = results[0].media[0].tinygif.url

        message.channel.send('', { files: [gif] })
      } else {
        message.reply(`Desculpe, ${message.author} mas não achei :(`)
      }
    } catch (error) {
      console.log(error.message)
    }
  }
}
