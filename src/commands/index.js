import { Message, MessageEmbed } from 'discord.js'
import ytdl from 'ytdl-core'
import ytsr from 'ytsr'

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

  if (content.startsWith('.play')) {
    if (message.member.voice.channel) {
      const { channel } = message.member.voice
      const command = content.split(' ')

      if (command.length <= 1) {
        message.channel.send('Informe a música')
        return
      }

      const connection = await channel.join()

      let dispatcher
      const embed = new MessageEmbed()

      embed.setColor('#8e44ad').setDescription('Tocando...')

      if (ytdl.validateURL(command[1])) {
        const info = await ytdl.getBasicInfo(command[1])
        embed.setTitle(info.title)
        embed.setURL(command[1])

        dispatcher = connection.play(ytdl(command[1], { filter: 'audioonly' }))
      } else {
        ytsr(
          command.filter((p) => p !== '.play').join(' '),
          (err, response) => {
            if (err) {
              message.channel.send('Desculpe, mas ocorreu um erro!')
            }

            embed.setTitle(response.items[0].title)
            embed.setURL(response.items[0].link)

            message.channel.send(embed)

            dispatcher = connection.play(
              ytdl(response.items[0].link, { filter: 'audioonly' })
            )
          }
        )
      }

      if (dispatcher) {
        dispatcher.on('finish', () => {
          message.channel.send('Acaboou!')
        })
      }
    } else {
      message.reply('Você tem que conectar a uma sala de voz primeiro!')
    }
  }
}
