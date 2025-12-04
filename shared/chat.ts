export interface UserMessage {
  time: string
  message: string
}

export interface CharacterMessage {
  message: string
  next_trigger: string
}

export interface SystemMessage {
  time: string
  system: string
}

export interface Reference {
  content: string
  type: 'memory'
}
