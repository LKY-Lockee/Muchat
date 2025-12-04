import db from '#/store/database'
import memoryManager from '#/store/memoryManager'
import type { Character, Topic, Message } from '&/character'
import { BrowserWindow } from 'electron'
import { IpcService, IpcMethod, type IpcContext } from 'electron-ipc-decorator'

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS characters (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    prompt TEXT NOT NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY,
    characterId TEXT NOT NULL,
    name TEXT NOT NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    FOREIGN KEY (characterId) REFERENCES characters(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    topicId TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    thinkCollapsed INTEGER DEFAULT 0,
    createdAt INTEGER NOT NULL,
    FOREIGN KEY (topicId) REFERENCES topics(id)
  );

  CREATE INDEX IF NOT EXISTS idx_topics_characterId ON topics(characterId);
  CREATE INDEX IF NOT EXISTS idx_messages_topicId ON messages(topicId);
  CREATE INDEX IF NOT EXISTS idx_characters_updatedAt ON characters(updatedAt);
  CREATE INDEX IF NOT EXISTS idx_topics_updatedAt ON topics(updatedAt);
  CREATE INDEX IF NOT EXISTS idx_messages_createdAt ON messages(createdAt);
`)

// Prepare statements
const statements = {
  // Characters
  getAllCharacters: db.prepare<never[], Character>(
    'SELECT * FROM characters ORDER BY updatedAt DESC',
  ),
  getCharacterById: db.prepare<string, Character>('SELECT * FROM characters WHERE id = ?'),
  upsertCharacter: db.prepare<[string, string, string, number, number], never>(
    'INSERT OR REPLACE INTO characters (id, name, prompt, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
  ),
  deleteCharacter: db.prepare<string, never>('DELETE FROM characters WHERE id = ?'),

  // Topics
  getTopicById: db.prepare<string, Topic>('SELECT * FROM topics WHERE id = ?'),
  getTopicsByCharacterId: db.prepare<string, Topic>(
    'SELECT * FROM topics WHERE characterId = ? ORDER BY updatedAt DESC',
  ),
  upsertTopic: db.prepare<[string, string, string, number, number], never>(
    'INSERT OR REPLACE INTO topics (id, characterId, name, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
  ),
  deleteTopic: db.prepare<string, never>('DELETE FROM topics WHERE id = ?'),
  deleteTopicsByCharacterId: db.prepare<string, never>('DELETE FROM topics WHERE characterId = ?'),

  // Messages
  getMessageById: db.prepare<string, Record<string, unknown>>(
    'SELECT * FROM messages WHERE id = ?',
  ),
  getMessagesByTopicId: db.prepare<string, Record<string, unknown>>(
    'SELECT * FROM messages WHERE topicId = ? ORDER BY createdAt ASC',
  ),
  upsertMessage: db.prepare<[string, string, string, string, number, number], never>(
    'INSERT OR REPLACE INTO messages (id, topicId, role, content, thinkCollapsed, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
  ),
  deleteMessage: db.prepare<string, never>('DELETE FROM messages WHERE id = ?'),
  deleteMessagesByTopicId: db.prepare<string, never>('DELETE FROM messages WHERE topicId = ?'),
}

export class CharacterManagerService extends IpcService {
  static readonly groupName = 'characterManager'

  // Character
  @IpcMethod()
  ipcGetAllCharacters(): Character[] {
    return this.getAllCharacters()
  }
  getAllCharacters(): Character[] {
    return statements.getAllCharacters.all()
  }

  @IpcMethod()
  ipcGetCharacterById(context: IpcContext, characterId: string): Character | undefined {
    return this.getCharacterById(characterId)
  }
  getCharacterById(characterId: string): Character | undefined {
    return statements.getCharacterById.get(characterId)
  }

  @IpcMethod()
  ipcAddOrUpdateCharacter(context: IpcContext, character: Character) {
    return this.addOrUpdateCharacter(character)
  }
  addOrUpdateCharacter(character: Character) {
    statements.upsertCharacter.run(
      character.id,
      character.name,
      character.prompt,
      character.createdAt || Date.now(),
      character.updatedAt || Date.now(),
    )

    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send('chat:characterUpdated')
    })

    this.addOrUpdateTopic(
      this.getTopicById(`default-${character.id}`) || {
        id: `default-${character.id}`,
        characterId: character.id,
        name: '主会话',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    )
  }

  @IpcMethod()
  ipcDeleteCharacter(context: IpcContext, characterId: string) {
    return this.deleteCharacter(characterId)
  }
  deleteCharacter(characterId: string) {
    const topics = statements.getTopicsByCharacterId.all(characterId)

    topics.forEach((topic) => {
      statements.deleteMessagesByTopicId.run(topic.id)
      memoryManager.deleteAllMemories({ agentId: topic.id })
    })

    statements.deleteTopicsByCharacterId.run(characterId)

    statements.deleteCharacter.run(characterId)
    memoryManager.deleteAllMemories({ agentId: `default-${characterId}` })

    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send('chat:characterUpdated')
    })
  }

  // Topic
  @IpcMethod()
  ipcGetTopicsByCharacterId(context: IpcContext, characterId: string): Topic[] {
    return this.getTopicsByCharacterId(characterId)
  }
  getTopicsByCharacterId(characterId: string): Topic[] {
    return statements.getTopicsByCharacterId
      .all(characterId)
      .filter((i) => !i.id.startsWith('default-'))
  }

  @IpcMethod()
  ipcGetTopicById(context: IpcContext, topicId: string): Topic | undefined {
    return this.getTopicById(topicId)
  }
  getTopicById(topicId: string): Topic | undefined {
    return statements.getTopicById.get(topicId)
  }

  @IpcMethod()
  ipcAddOrUpdateTopic(context: IpcContext, topic: Topic) {
    return this.addOrUpdateTopic(topic)
  }
  addOrUpdateTopic(topic: Topic) {
    statements.upsertTopic.run(
      topic.id,
      topic.characterId,
      topic.name,
      topic.createdAt || Date.now(),
      topic.updatedAt || Date.now(),
    )

    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send('chat:topicUpdated')
    })
  }

  @IpcMethod()
  ipcDeleteTopic(context: IpcContext, characterId: string, topicId: string) {
    return this.deleteTopic(characterId, topicId)
  }
  deleteTopic(characterId: string, topicId: string) {
    statements.deleteMessagesByTopicId.run(topicId)

    statements.deleteTopic.run(topicId)
    memoryManager.deleteAllMemories({ agentId: topicId })

    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send('chat:topicUpdated')
    })
  }

  // Message
  @IpcMethod()
  ipcGetMessagesByTopicId(context: IpcContext, topicId: string): Message[] {
    return this.getMessagesByTopicId(topicId)
  }
  getMessagesByTopicId(topicId: string): Message[] {
    const rows = statements.getMessagesByTopicId.all(topicId)
    return rows.map((row) => ({
      id: row.id as string,
      topicId: row.topicId as string,
      role: row.role as 'system' | 'user' | 'assistant',
      content: row.content as string,
      thinkCollapsed: row.thinkCollapsed === 1,
      createdAt: row.createdAt as number,
    }))
  }

  @IpcMethod()
  ipcGetMessageById(context: IpcContext, messageId: string): Message | undefined {
    return this.getMessageById(messageId)
  }
  getMessageById(messageId: string): Message | undefined {
    const row = statements.getMessageById.get(messageId)
    if (!row) return undefined

    return {
      id: row.id as string,
      topicId: row.topicId as string,
      role: row.role as 'system' | 'user' | 'assistant',
      content: row.content as string,
      thinkCollapsed: row.thinkCollapsed === 1,
      createdAt: row.createdAt as number,
    }
  }

  @IpcMethod()
  ipcAddOrUpdateMessage(context: IpcContext, message: Message) {
    return this.addOrUpdateMessage(message)
  }
  addOrUpdateMessage(message: Message) {
    statements.upsertMessage.run(
      message.id,
      message.topicId,
      message.role,
      message.content,
      message.thinkCollapsed ? 1 : 0,
      message.createdAt || Date.now(),
    )

    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send('chat:messageUpdated')
    })
  }

  @IpcMethod()
  ipcDeleteMessage(context: IpcContext, topicId: string, messageId: string) {
    return this.deleteMessage(topicId, messageId)
  }
  deleteMessage(topicId: string, messageId: string) {
    statements.deleteMessage.run(messageId)

    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send('chat:messageUpdated')
    })
  }
}

const characterManager = new CharacterManagerService()
export default characterManager
