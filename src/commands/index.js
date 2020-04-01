import { Message, MessageEmbed } from 'discord.js'
import { promisify } from 'util'
import ytdl from 'ytdl-core'
import ytsr from 'ytsr'

import config from '../config'

import { tenor } from '../services/api'

import Queue from '../util/Queue'

const queue = new Queue()
let dispatcher
let connection

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
    if (message.member.voice.channel || !message.author.bot) {
      const { channel } = message.member.voice
      const command = content.split(' ')

      if (command.length <= 1) {
        message.channel.send('Informe a música')
        return
      }

      if (!connection) {
        console.log('Conectando ao canal ' + channel.id)
        connection = await channel.join()
      }

      handleQueue(command).then(({ queue: resolved, embed }) => {
        message.channel.send(embed)
        queue._queue = resolved._queue
        if (!(queue.getLength() >= 2)) {
          dispatcher = connection.play(
            ytdl(resolved.getFirst().url, { filter: 'audioonly' })
          )
        } else {
          dispatcher.on('finish', () => {
            queue.remove(0)
            dispatcher = connection.play(
              ytdl(queue.getFirst().url, { filter: 'audioonly' })
            )
          })
        }
      })
    } else {
      message.reply('Você tem que conectar a uma sala de voz primeiro!')
    }
  }

  if (content.startsWith('.queue')) {
    const embed = new MessageEmbed()

    embed.setTitle('Queue!').setColor('#3d3d3d')

    queue._queue.map((music, index) => {
      embed.addField(
        `${index}\t${music.title}` || 'Música sem título',
        music.duration || 'Sem tempo'
      )
    })

    message.channel.send(embed)
  }

  if (content.startsWith('.pause')) {
    if (dispatcher) {
      dispatcher.pause()
    }
  }

  if (content.startsWith('.resume')) {
    if (dispatcher) {
      dispatcher.resume()
    }
  }

  if (content.startsWith('.next')) {
    if (dispatcher) {
      dispatcher.end()
    }
  }

  if (content.startsWith('.stop')) {
    if (connection) {
      queue._queue = []
      message.channel.send(`Adios meu caro ${message.author.username}!`)
      connection.disconnect()
      connection = null
    }
  }

  if (content.startsWith('.remove')) {
    const [_, index] = content.split(' ')

    queue.remove(parseInt(index))

    message.channel.send('Removido!')
  }
}

const handleQueue = (param) => {
  return new Promise((resolve, reject) => {
    const embed = new MessageEmbed()
    embed.setColor('#3d3d3d').setTitle('Adicionando a fila...')

    try {
      if (ytdl.validateURL(param[1])) {
        ytdl.getBasicInfo(param[1]).then((info) => {
          embed.setDescription(info.title).setURL(param[1])
          queue.add({
            title: info.title,
            url: param[1],
            duration: `\t${new Date(info.length_seconds / 1000)
              .toISOString()
              .slice(11, 1)}`,
          })
        })

        resolve({ queue, embed })
      } else {
        const ytsrPromise = promisify(ytsr)
        ytsrPromise(param.filter((p) => p !== '.play').join(' ')).then(
          (response) => {
            embed
              .setDescription(response.items[0].title)
              .setURL(response.items[0].link)

            queue.add({
              title: response.items[0].title,
              url: response.items[0].link,
              duration: `\t${response.items[0].duration}`,
            })
            resolve({ queue, embed })
          }
        )
      }
    } catch (error) {
      reject(error)
    }
  })
}
