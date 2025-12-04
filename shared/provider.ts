export interface Provider {
  id: string
  name: string
  icon: string
  websites: {
    official: string
    apiKey?: string
  }
  type: string
  url: string
  apiKey?: string
}

export interface Model {
  id: string
  provider: string
  object: string
  owned_by: string
  type: 'chat' | 'reasoning' | 'embedding' | 'other'
}
