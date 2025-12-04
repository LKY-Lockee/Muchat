import { MemoryManagerService } from './store/memoryManager'
import { ProactiveChatService } from './service/proactiveChat'
import { ProviderManagerService } from './store/providerManager'
import { CharacterManagerService } from './store/characterManager'
import { createServices, MergeIpcService } from 'electron-ipc-decorator'

export const services = createServices([
  CharacterManagerService,
  ProviderManagerService,
  MemoryManagerService,

  ProactiveChatService,
])

export type IpcServices = MergeIpcService<typeof services>
