import { Memory, MemoryConfig } from 'mem0ai/oss'

const config: MemoryConfig = {
  embedder: {
    provider: 'openai',
    config: {
      
    }
  },
  vectorStore: {
    provider: '',
    config: undefined
  },
  llm: {
    provider: '',
    config: undefined
  }
}

const memory = new Memory(config)

function withMemory()
{

}
