import { Reference } from '&/chat'
import { type Message } from '&/character'
import Store from 'electron-store'
import { deepmerge } from 'deepmerge-ts'
import * as oss from 'mem0ai-nosqlite/oss'
import { type IpcContext, IpcMethod, IpcService } from 'electron-ipc-decorator'

let memoryConfig: oss.MemoryConfig = {
  embedder: {
    provider: 'openai',
    apiKey: '',
    baseURL: '',
    model: '',
    embeddingDims: 2048,
  },
  vectorStore: {
    provider: 'qdrant',
    collectionName: 'memories',
    dimension: 2048,
  },
  llm: {
    provider: 'openai',
    apiKey: '',
    baseURL: '',
    model: '',
  },
  disableHistory: true,
  historyStore: {
    provider: 'memory',
  },
  graphStore: {
    provider: 'neo4j',
    config: {
      url: '',
      username: '',
      password: '',
    },
  },
}

const store = new Store()

if (!store.has('memoryConfig')) {
  store.set('memoryConfig', memoryConfig)
} else {
  memoryConfig = store.get('memoryConfig') as oss.MemoryConfig
}
if (!store.has('customMemoryConfig')) {
  store.set('customMemoryConfig', '{}')
}

let memory = new oss.Memory(memoryConfig)

export class MemoryManagerService extends IpcService {
  static readonly groupName = 'memoryManager'

  @IpcMethod()
  ipcGetConfig(): oss.MemoryConfig {
    return this.getConfig()
  }
  getConfig(): oss.MemoryConfig {
    return memoryConfig
  }

  @IpcMethod()
  ipcUpdateConfig(context: IpcContext, config: Partial<oss.MemoryConfig>) {
    this.updateConfig(config)
  }
  updateConfig(config: Partial<oss.MemoryConfig>) {
    const mergeConfig = deepmerge(memoryConfig, config)
    memory = new oss.Memory(mergeConfig)
    store.set('memoryConfig', mergeConfig)
  }

  @IpcMethod()
  ipcGetCustomConfigString(): string {
    return this.getCustomConfigString()
  }
  getCustomConfigString(): string {
    return store.get('customMemoryConfig') as string
  }

  @IpcMethod()
  ipcUpdateConfigByJSONString(context: IpcContext, configString: string) {
    this.updateConfigByJSONString(configString)
  }
  updateConfigByJSONString(configString: string) {
    const config = JSON.parse(configString) as Partial<oss.MemoryConfig>
    this.updateConfig({ ...memoryConfig, ...config })
    store.set('customMemoryConfig', configString)
  }

  @IpcMethod()
  ipcAddMemory(
    context: IpcContext,
    messages: Message[],
    config: oss.AddMemoryOptions,
  ): Promise<oss.SearchResult> {
    return this.addMemory(messages, config)
  }
  async addMemory(messages: Message[], config: oss.AddMemoryOptions): Promise<oss.SearchResult> {
    return await memory.add(
      messages.map((msg) => {
        return {
          role: msg.role,
          content: msg.content,
        }
      }),
      { userId: 'default', ...config },
    )
  }

  @IpcMethod()
  ipcGetAllMemories(
    context: IpcContext,
    config: oss.GetAllMemoryOptions,
  ): Promise<oss.SearchResult> {
    return this.getAllMemories(config)
  }
  async getAllMemories(config: oss.GetAllMemoryOptions): Promise<oss.SearchResult> {
    return await memory.getAll({ userId: 'default', ...config })
  }

  @IpcMethod()
  ipcSearchMemory(
    context: IpcContext,
    query: string,
    config: oss.SearchMemoryOptions,
  ): Promise<oss.SearchResult> {
    return this.searchMemory(query, config)
  }
  async searchMemory(query: string, config: oss.SearchMemoryOptions): Promise<oss.SearchResult> {
    return await memory.search(query, { userId: 'default', ...config })
  }

  @IpcMethod()
  ipcDeleteAllMemories(context: IpcContext, config: oss.DeleteAllMemoryOptions) {
    return this.deleteAllMemories(config)
  }
  async deleteAllMemories(config: oss.DeleteAllMemoryOptions) {
    await memory.deleteAll({ userId: 'default', ...config })
  }

  @IpcMethod()
  ipcAppendMemory(
    context: IpcContext,
    message: Message,
    query: string,
    config: oss.SearchMemoryOptions,
  ) {
    return this.appendMemory(message, query, config)
  }
  async appendMemory(message: Message, query: string, config: oss.SearchMemoryOptions) {
    const memories = await this.searchMemory(query, config)
    const memoriesString = memories.results
      .map((m) => {
        return {
          content: m.memory,
          type: 'memory',
        } as Reference
      })
      .map((m) => JSON.stringify(m))
      .join('\n')
    message.content += memoriesString
  }
}

const memoryManager = new MemoryManagerService()
export default memoryManager
