import { join, dirname } from 'path'
import { Low, JSONFile } from 'lowdb'
import { fileURLToPath } from 'url'

import TelegramBot from 'node-telegram-bot-api'

if (!process.env.TG_TOKEN) throw new Error('TG_TOKEN is missing')
if (!process.env.DELETE_AFTER) throw new Error('DELETE_AFTER is missing')

const DELETE_AFTER_MS = (await import('ms')).default(process.env.DELETE_AFTER)

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
  const deletedMessagesIds: string[] = []
  try {
    const messages = db.data.messages!
    for (let i = 0; i < messages.length && messages[i].timestamp < Date.now() - DELETE_AFTER_MS; i++) {
      await bot.deleteMessage(messages[i].chatId, messages[i].messageId)
      console.log(`Deleted message id=${messages[i].messageId}`)
      deletedMessagesIds.push(messages[i].messageId)
      await new Promise(res => setTimeout(res, 100))
    }
  } catch (err: any) {
    console.error(err.message)
  } finally {
    if (deletedMessagesIds.length > 0) {
      console.log(`Finished deleting ${deletedMessagesIds.length} messages`)
      db.data.messages = db.data.messages.filter(x => !deletedMessagesIds.includes(x.messageId))
      await db.write()
    }
    isDeletingMessagesLock = false
  }
}, 30_000)

bot.on('message', async msg => {
  db.data?.messages.push({ chatId: msg.chat.id + '', messageId: msg.message_id + '', timestamp: Date.now() })
  await db.write()
})
