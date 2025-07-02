import { openDB, type IDBPDatabase } from 'idb'
import type { Message } from '../service/chat'

const DB_NAME = 'ChatDB'
const DB_VERSION = 1

export interface Character {
  id: string
  name: string
  prompt: string
  topics: string[]
}

export interface Topic {
  id: string
  name: string
  messages: string[]
}

class CharacterManager {
  private dbPromise: Promise<IDBPDatabase<unknown>>
  private onMessageAdded: ((topicId: string, newMessage: Message) => void)[] = []
  private onMessageUpdated: ((topicId: string, updatedMessage: Message) => void)[] = []
  private onMessageDeleted: ((topicId: string, messageId: string) => void)[] = []

  constructor() {
    this.dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Characters
        if (!db.objectStoreNames.contains('characters')) {
          const store = db.createObjectStore('characters', {
            keyPath: 'id',
          })
          store.createIndex('id', 'id', { unique: true })
        }

        // Topics
        if (!db.objectStoreNames.contains('topics')) {
          const store = db.createObjectStore('topics', {
            keyPath: 'id',
          })
          store.createIndex('id', 'id', { unique: true })
        }

        // Messages
        if (!db.objectStoreNames.contains('messages')) {
          const store = db.createObjectStore('messages', {
            keyPath: 'id',
          })
          store.createIndex('id', 'id', { unique: true })
        }
      },
    })
  }

  // Character

  async addOrUpdateCharacter(character: Character) {
    const db = await this.dbPromise
    await db.put('characters', character)
  }

  async deletecharacter(characterId: string) {
    const db = await this.dbPromise
    const tx = db.transaction(['characters', 'topics', 'messages'], 'readwrite')
    const charactersStore = tx.objectStore('characters')
    const topicsStore = tx.objectStore('topics')
    const messagesStore = tx.objectStore('messages')

    const character = await charactersStore.get(characterId)
    // Delete all topicss
    if (character && character.topics) {
      for (const topicId of character.topics) {
        // Delete messages
        const topic = await topicsStore.get(topicId)
        if (topic && topic.messages) {
          for (const messageId of topic.messages) {
            await messagesStore.delete(messageId)
          }
        }
        await topicsStore.delete(topicId)
      }
    }

    // Delete character
    await charactersStore.delete(characterId)

    await tx.done
  }

  async getAllCharacters() {
    const db = await this.dbPromise

    const tx = db.transaction('characters', 'readonly')
    const store = tx.objectStore('characters')
    const characters = await store.getAll()

    await tx.done

    return characters
  }

  async getCharacterById(characterId: string): Promise<Character | undefined> {
    const db = await this.dbPromise
    return await db.get('characters', characterId)
  }

  // Topic

  async updateTopic(topic: Topic) {
    const db = await this.dbPromise
    await db.put('topics', topic)
  }

  async addTopicToCharacter(characterId: string, topic: Topic) {
    const db = await this.dbPromise
    const tx = db.transaction(['characters', 'topics'], 'readwrite')
    const charactersStore = tx.objectStore('characters')
    const topicsStore = tx.objectStore('topics')

    const character = await charactersStore.get(characterId)
    if (!character) {
      throw new Error(`Character with ID ${characterId} not found`)
    }

    character.topics.push(topic.id)
    await charactersStore.put(character)
    await topicsStore.put(topic)

    await tx.done
  }

  async deleteTopicFromCharacter(characterId: string, topicId: string) {
    const db = await this.dbPromise
    const tx = db.transaction(['characters', 'topics', 'messages'], 'readwrite')
    const charactersStore = tx.objectStore('characters')
    const topicsStore = tx.objectStore('topics')
    const messagesStore = tx.objectStore('messages')

    // Delete messages
    const topic = await topicsStore.get(topicId)
    if (topic && topic.messages) {
      for (const messageId of topic.messages) {
        await messagesStore.delete(messageId)
      }
    }

    // Delete topic
    await topicsStore.delete(topicId)

    // Update character
    const character = (await charactersStore.get(characterId)) as Character | undefined
    if (character) {
      character.topics = character.topics.filter((id) => id !== topicId)
      await charactersStore.put(character)
    }

    await tx.done
  }

  async getTopicsByCharacterId(characterId: string): Promise<Topic[]> {
    const db = await this.dbPromise
    const tx = db.transaction(['characters', 'topics'], 'readonly')
    const charactersStore = tx.objectStore('characters')
    const topicsStore = tx.objectStore('topics')

    const character = (await charactersStore.get(characterId)) as Character | undefined
    if (!character || !character.topics) {
      return []
    }

    const topics: Topic[] = []
    for (const topicId of character.topics) {
      const topic = (await topicsStore.get(topicId)) as Topic | undefined
      if (topic) {
        topics.push(topic)
      }
    }

    await tx.done
    return topics
  }

  async getTopicById(topicId: string): Promise<Topic | undefined> {
    const db = await this.dbPromise
    return (await db.get('topics', topicId)) as Topic | undefined
  }

  // Message

  async updateMessage(topicId: string, message: Message) {
    const db = await this.dbPromise
    await db.put('messages', message)

    for (const callback of this.onMessageUpdated) {
      callback(topicId, message)
    }
  }

  async addMessageToTopic(topicId: string, message: Message) {
    const db = await this.dbPromise
    const tx = db.transaction(['topics', 'messages'], 'readwrite')
    const topicsStore = tx.objectStore('topics')
    const messagesStore = tx.objectStore('messages')

    const topic = (await topicsStore.get(topicId)) as Topic | undefined
    if (!topic) {
      throw new Error(`Topic with ID ${topicId} not found`)
    }

    if (message.id) {
      topic.messages.push(message.id)
    }
    await topicsStore.put(topic)
    await messagesStore.put(message)

    await tx.done

    for (const callback of this.onMessageAdded) {
      callback(topicId, message)
    }
  }

  async deleteMessageFromTopic(topicId: string, messageId: string) {
    const db = await this.dbPromise
    const tx = db.transaction(['topics', 'messages'], 'readwrite')
    const topicsStore = tx.objectStore('topics')
    const messagesStore = tx.objectStore('messages')

    // Delete message
    await messagesStore.delete(messageId)

    // Update topic
    const topic = (await topicsStore.get(topicId)) as Topic | undefined
    if (topic) {
      topic.messages = topic.messages.filter((id) => id !== messageId)
      await topicsStore.put(topic)
    }

    await tx.done

    for (const callback of this.onMessageDeleted) {
      callback(topicId, messageId)
    }
  }

  async getMessagesByTopicId(topicId: string): Promise<Message[]> {
    const db = await this.dbPromise
    const tx = db.transaction(['topics', 'messages'], 'readonly')
    const topicsStore = tx.objectStore('topics')
    const messagesStore = tx.objectStore('messages')

    const topic = (await topicsStore.get(topicId)) as Topic | undefined
    if (!topic || !topic.messages) {
      return []
    }

    const messages: Message[] = []
    for (const messageId of topic.messages) {
      const message = (await messagesStore.get(messageId)) as Message | undefined
      if (message) {
        messages.push(message)
      }
    }

    await tx.done
    return messages
  }

  async getMessageById(messageId: string): Promise<Message | undefined> {
    const db = await this.dbPromise
    return (await db.get('messages', messageId)) as Message | undefined
  }

  // Listeners

  addOnMessageAddedListener(callback: (topicId: string, newMessage: Message) => void) {
    this.onMessageAdded.push(callback)
  }

  removeOnMessageAddedListener(callback: (topicId: string, newMessage: Message) => void) {
    this.onMessageAdded = this.onMessageAdded.filter((cb) => cb !== callback)
  }

  addOnMessageUpdatedListener(callback: (topicId: string, updatedMessage: Message) => void) {
    this.onMessageUpdated.push(callback)
  }

  removeOnMessageUpdatedListener(callback: (topicId: string, updatedMessage: Message) => void) {
    this.onMessageUpdated = this.onMessageUpdated.filter((cb) => cb !== callback)
  }

  addOnMessageDeletedListener(callback: (topicId: string, messageId: string) => void) {
    this.onMessageDeleted.push(callback)
  }

  removeOnMessageDeletedListener(callback: (topicId: string, messageId: string) => void) {
    this.onMessageDeleted = this.onMessageDeleted.filter((cb) => cb !== callback)
  }
}

const characterManager = new CharacterManager()
export default characterManager
