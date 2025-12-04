import { OpenAIChat } from '#/service/chat'
import memoryManager from '#/store/memoryManager'
import characterManager from '#/store/characterManager'
import uuid from '&/utils/uuid'
import { Message } from '&/character'
import { getProactiveChatPrompt } from '&/config/prompts'
import { CharacterMessage, SystemMessage, UserMessage } from '&/chat'
import schedule, { Job } from 'node-schedule'
import { IpcMethod, IpcService, type IpcContext } from 'electron-ipc-decorator'
import { ResponseFormatJSONObject, ResponseFormatJSONSchema } from 'openai/resources/shared.mjs'

export class ProactiveChatService extends IpcService {
  static readonly groupName = 'proactiveChat'

  private jobMap: Map<string, Job> = new Map()

  @IpcMethod()
  async ipcChatAndAutoSchedule(
    context: IpcContext,
    chatOption: {
      apiURL: string
      apiKey: string
      model: string
      temperature: number
      json: ResponseFormatJSONSchema | ResponseFormatJSONObject
    },
    characterId: string,
    topicId: string,
    message: string,
  ) {
    return this.chatAndAutoSchedule(chatOption, characterId, topicId, message)
  }
  async chatAndAutoSchedule(
    chatOption: {
      apiURL: string
      apiKey: string
      model: string
      temperature: number
      json: ResponseFormatJSONSchema | ResponseFormatJSONObject
    },
    characterId: string,
    topicId: string,
    message: string,
  ) {
    const now = new Date()
    // const randomTime = new Date(now.getTime() + Math.random() * 10 * 60 * 1000)
    const randomTime = new Date(now.getTime() + Math.random() * 10 * 1000)

    await this.scheduleProactiveChat(
      chatOption,
      characterId,
      topicId,
      randomTime.toLocaleString(),
      message,
    )
  }

  @IpcMethod()
  async ipcScheduleProactiveChat(
    context: IpcContext,
    chatOption: {
      apiURL: string
      apiKey: string
      model: string
      temperature: number
      json: ResponseFormatJSONSchema | ResponseFormatJSONObject
    },
    characterId: string,
    topicId: string,
    trigger: string,
    message?: string,
  ) {
    return this.scheduleProactiveChat(chatOption, characterId, topicId, trigger, message)
  }
  async scheduleProactiveChat(
    chatOption: {
      apiURL: string
      apiKey: string
      model: string
      temperature: number
      json: ResponseFormatJSONSchema | ResponseFormatJSONObject
    },
    characterId: string,
    topicId: string,
    trigger: string,
    message?: string,
  ) {
    const chat = new OpenAIChat(
      chatOption.apiURL,
      chatOption.apiKey,
      chatOption.model,
      chatOption.temperature,
      chatOption.json,
    )

    // Get existing messages
    let messages = characterManager.getMessagesByTopicId(topicId)

    // User sent message
    if (message) {
      const lastMessage = messages.at(-1)
      const formattedUserMessage = JSON.stringify([
        {
          time: new Date(trigger).toLocaleString(),
          message: message,
        },
      ] as UserMessage[])
      // If the last message is from user, merge them
      if (lastMessage?.role === 'user') {
        lastMessage.content = this.mergeMessages(lastMessage.content, formattedUserMessage)
        characterManager.addOrUpdateMessage(lastMessage)
      }
      // Else, push a new message
      else {
        const userMessage: Message = {
          role: 'user',
          content: formattedUserMessage,
          id: uuid(),
          topicId: topicId,
          createdAt: Date.now(),
        }
        messages.push(userMessage)
        characterManager.addOrUpdateMessage(userMessage)
      }
    }
    // System triggered message
    else {
      console.log('Execute proactive chat:', topicId)
      messages.push({
        role: 'user',
        content: JSON.stringify([
          {
            time: new Date(trigger).toLocaleString(),
            system: 'User did not respond. Please send your next message to user.',
          },
        ] as SystemMessage[]),
        id: uuid(),
        topicId: topicId,
        createdAt: Date.now(),
      })
    }

    const date = new Date(trigger)
    const executeChat = async () => {
      const character = characterManager.getCharacterById(characterId)
      if (!character) throw new Error('未知角色')

      // Assemble system prompt
      const characterPrompt = character.prompt
      let systemMessage: Message | null = null
      if (characterPrompt) {
        systemMessage = {
          role: 'system',
          content: getProactiveChatPrompt(characterPrompt),
          id: uuid(),
          topicId: topicId,
          createdAt: Date.now(),
        }
      }

      if (systemMessage) {
        messages = [systemMessage, ...messages]
      }

      // Inject references
      const lastMessage = messages.at(-1)
      if (lastMessage && lastMessage.role === 'user') {
        lastMessage.content += '\n\nPlease make your response based on the reference information:\n'

        // Inject memories
        await memoryManager.appendMemory(
          lastMessage,
          message || '<system>User sent nothing, try get some memories randomly.</system>',
          {
            limit: 5,
            agentId: topicId,
          },
        )
      }

      // Non-streaming chat
      const characterMessage = await chat.chat(messages)

      // Streaming chat
      // let characterMessage = ''
      // for await (const chunk of chat.chatStream(messages)) {
      //   characterMessage += chunk
      // }

      if (!characterMessage) throw new Error('未接收到任何消息')

      try {
        // Can't avoid AI returning an array, so we just take the last one
        let response: CharacterMessage | Array<CharacterMessage> | undefined =
          JSON.parse(characterMessage)
        if (Array.isArray(response)) {
          response = response.at(-1)
        }

        if (!response) throw new Error('消息格式化错误')

        const lastMessage = messages.at(-1)
        if (lastMessage?.role === 'assistant') {
          // Merge assistant messages
          lastMessage.content = this.mergeMessages(lastMessage.content, characterMessage)
          characterManager.addOrUpdateMessage(lastMessage)
        } else {
          characterManager.addOrUpdateMessage({
            role: 'assistant',
            content: JSON.stringify([response]),
            id: uuid(),
            topicId: topicId,
            createdAt: Date.now(),
          })
        }

        memoryManager.addMemory(messages, {
          agentId: topicId,
          infer: true,
        })

        this.scheduleProactiveChat(chatOption, characterId, topicId, response.next_trigger)
      } catch {
        /* TODO */
      }
    }

    if (date <= new Date()) {
      console.log('Proactive chat triggered immediately:', topicId)
      await executeChat()
    } else {
      this.cancelProactiveChat(topicId)
      console.log('Proactive chat scheduled:', topicId, date)
      const job = schedule.scheduleJob(date, executeChat)
      this.jobMap.set(topicId, job)
    }
  }

  @IpcMethod()
  ipcCancelProactiveChat(context: IpcContext, topicId: string) {
    this.cancelProactiveChat(topicId)
  }
  cancelProactiveChat(topicId: string) {
    const job = this.jobMap.get(topicId)
    if (job) {
      job.cancel()
      this.jobMap.delete(topicId)
      console.log('Proactive chat cancelled:', topicId)
    }
  }

  private mergeMessages(history: string, newMessage: string): string {
    const historyObj = JSON.parse(history)
    const newMessageObj = JSON.parse(newMessage)

    const merged = [historyObj, newMessageObj].flat()

    return JSON.stringify(merged)
  }
}

const proactiveChat = new ProactiveChatService()
export default proactiveChat
