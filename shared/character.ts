export interface Character {
  id: string
  name: string
  prompt: string
  createdAt: number
  updatedAt: number
}

export interface Topic {
  id: string
  characterId: string
  name: string
  createdAt: number
  updatedAt: number
}

export interface Message {
  id: string
  topicId: string
  role: 'system' | 'user' | 'assistant'
  content: string
  thinkCollapsed?: boolean
  createdAt: number
}
