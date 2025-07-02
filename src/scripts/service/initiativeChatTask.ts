import characterManager from '../store/characterManager'
import { CharacterMessage, Message, OpenAIChat } from './chat'
import uuid from '../utils/uuid'
import { getInitiativeChatPrompt } from '@/config/prompts'
import { Job } from 'node-schedule'

const jobMap: Record<string, Job> = {}

function mergeMessages(history: string, newMessage: string): string {
  const historyObj = JSON.parse(history)
  const newMessageObj = JSON.parse(newMessage)

  const merged = [historyObj, newMessageObj].flat()

  return JSON.stringify(merged)
}

export async function chatAndAutoSchedule(
  chat: OpenAIChat,
  characterId: string,
  topicId: string,
  message: string,
) {
  const now = new Date()
  const randomTime = new Date(now.getTime() + Math.random() * 10 * 60 * 1000)

  await scheduleInitiativeChat(chat, characterId, topicId, randomTime.toLocaleString(), message)
}

export async function scheduleInitiativeChat(
  chat: OpenAIChat,
  characterId: string,
  topicId: string,
  trigger: string,
  message?: string,
) {
  let messages = await characterManager.getMessagesByTopicId(topicId)

  if (message) {
    const lastMessage = messages.at(-1)
    if (lastMessage?.role === 'user') {
      lastMessage.content = mergeMessages(lastMessage.content, message)
      await characterManager.updateMessage(topicId, lastMessage)
    } else {
      const userMessage: Message = {
        role: 'user',
        content: `[{"time":"${new Date(trigger).toLocaleString()}","message":"${message}"}]`,
        id: uuid(),
      }
      messages.push(userMessage)
      await characterManager.addMessageToTopic(topicId, userMessage)
    }
  } else {
    console.log('Execute initiative chat:', topicId)
    messages.push({
      role: 'user',
      content: `[{"time":${new Date(trigger).toLocaleString()},"system":"Please generate your next message."}]`,
    })
  }

  const date = new Date(trigger)
  const executeChat = async () => {
    const characterPrompt = (await characterManager.getCharacterById(characterId)).prompt
    let systemMessage: Message | null = null
    if (characterPrompt) {
      systemMessage = {
        role: 'system',
        content: getInitiativeChatPrompt(characterPrompt),
      }
    }
    if (systemMessage) {
      messages = [systemMessage, ...messages]
    }

    const characterMessage = await chat.chat(messages)
    // Can't avoid AI returning an array, so we just take the last one
    let response: CharacterMessage | Array<CharacterMessage> = JSON.parse(characterMessage)
    if (Array.isArray(response)) {
      response = response.at(-1)
    }

    const lastMessage = messages.at(-2)
    if (lastMessage?.role === 'assistant') {
      lastMessage.content = mergeMessages(lastMessage.content, characterMessage)
      await characterManager.updateMessage(topicId, lastMessage)
    } else {
      await characterManager.addMessageToTopic(topicId, {
        role: 'assistant',
        content: `[${JSON.stringify(response)}]`,
        id: uuid(),
      })
    }

    scheduleInitiativeChat(chat, characterId, topicId, response.next_trigger)
  }

  if (date <= new Date()) {
    console.log('Initiative chat triggered immediately:', topicId)
    await executeChat()
  } else {
    console.log('Initiative chat scheduled:', topicId, date)
    const job = window.schedule.scheduleJob(date, executeChat)

    cancelInitiativeChat(topicId)
    jobMap[topicId] = job
  }
}

export function cancelInitiativeChat(topicId: string) {
  const job = jobMap[topicId]
  if (job) {
    job.cancel()
    delete jobMap[topicId]
    console.log('Cancelled initiative chat:', topicId)
  }
}
