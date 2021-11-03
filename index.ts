import { join, dirname } from 'path'
import { Low, JSONFile } from 'lowdb'
import { fileURLToPath } from 'url'

import TelegramBot from 'node-telegram-bot-api'

if (!process.env.TG_TOKEN) throw new Error('TG_TOKEN is missing')
if (!process.env.DELETE_AFTER_TIME) throw new Error('DELETE_AFTER_TIME is missing')
if (!process.env.DELETE_AFTER_MESSAGES_COUNT) throw new Error('DELETE_AFTER_MESSAGES_COUNT is missing')

const DELETE_AFTER_TIME_MS = (await import('ms')).default(process.env.DELETE_AFTER_TIME)
const DELETE_AFTER_MESSAGES_COUNT = +process.env.DELETE_AFTER_MESSAGES_COUNT

type Data = { messages: Array<{ chatId: string; messageId: string; timestamp: number }> }
const __dirname = dirname(fileURLToPath(import.meta.url))
const db = new Low<Data>(new JSONFile<Data>(join(__dirname, 'db.json')))

await db.read()
db.data = db.data || { messages: [] }

const bot = new TelegramBot(process.env.TG_TOKEN, { polling: true })

// Check if there are old messages to clear every 30s
let isDeletingMessagesLock = false
setInterval(async () => {
  if (isDeletingMessagesLock || !db.data) return

  isDeletingMessagesLock = true
  try {
    const messages = db.data.messages!
    for (
      let i = 0;
      i < messages.length &&
      (messages.length > DELETE_AFTER_MESSAGES_COUNT || messages[i].timestamp < Date.now() - DELETE_AFTER_TIME_MS);
      i++
    ) {
      try {
        await bot.deleteMessage(messages[i].chatId, messages[i].messageId)
        console.log(`Deleted message id=${messages[i].messageId}`)
      } catch (err: any) {
        console.log(`Failed to delete message id=${messages[i].messageId}`)
        console.error(err.message)
      }
      db.data.messages.splice(i, 1)
      await db.write()
      i--
      await new Promise(res => setTimeout(res, 100))
    }
  } catch (err: any) {
    console.error(err.message)
  } finally {
    isDeletingMessagesLock = false
  }
}, 5_000)

bot.on('message', async msg => {
  db.data?.messages.push({ chatId: msg.chat.id + '', messageId: msg.message_id + '', timestamp: Date.now() })
  await db.write()
})
