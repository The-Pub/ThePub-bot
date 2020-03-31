import { Message } from 'discord.js'
import table from 'text-table'

import config from '../config'

import { tenor } from '../services/api'

/** @param {Message} message */
export default async function (message) {
  const { content } = message

  if (content === '.help') {
    message.reply('.git termo de busca | .pum')
  }

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

  if (content.startsWith('.jokenpo')) {
    const [_, user = '@ThePub-bot'] = content.split(' ')

    const ppt = ['Pedra', 'Papel', 'Tesoura']
    const choiceOne = ppt[Math.floor(Math.random() * ppt.length)]
    const choiceTwo = ppt[Math.floor(Math.random() * ppt.length)]

    let result

    if (choiceOne === choiceTwo) {
      result = choiceOne + ' x ' + choiceTwo + ': *Empate* :laughing:'
    } else if (
      (choiceOne === 'Pedra' && choiceTwo === 'Tesoura') ||
      (choiceOne === 'Papel' && choiceTwo === 'Pedra') ||
      (choiceOne === 'Tesoura' && choiceTwo === 'Papel')
    ) {
      result = choiceOne + ' x ' + choiceTwo + ': *Vitória* :wink:'
    } else {
      result =
        choiceOne + ' x ' + choiceTwo + ': *Derrota* :face_with_raised_eyebrow:'
    }

    message.reply(`${message.author} desafiou ${user}! ${result}`)
  }
}
