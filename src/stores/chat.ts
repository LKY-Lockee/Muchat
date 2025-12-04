import { Character, Message, Topic } from '&/character'
import { defineStore } from 'pinia'

export const useChatStore = defineStore('chat', {
  state: () => ({
    characters: [] as Character[],
    topics: [] as Topic[],
    currentCharacter: null as Character | null,
    currentTopic: null as Topic | null,
    messages: [] as Message[],
  }),
  getters: {
    getCharacters(state) {
      return state.characters
    },
    getTopics(state) {
      return state.topics
    },
    getCurrentCharacter(state) {
      return state.currentCharacter
    },
    getCurrentTopic(state) {
      return state.currentTopic
    },
    getMessages(state) {
      return state.messages
    },
  },
  actions: {
    async updateCharacters() {
      this.characters = await window.api.characterManager.ipcGetAllCharacters()
    },
    async setCurrentCharacter(character: Character | null) {
      this.currentCharacter = character
      this.updateTopics()
    },
    async updateTopics() {
      if (this.currentCharacter) {
        this.topics = await window.api.characterManager.ipcGetTopicsByCharacterId(
          this.currentCharacter.id,
        )
      } else {
        this.topics = []
      }
    },
    async setCurrentTopic(topic: Topic | null) {
      this.currentTopic = topic
      this.updateMessages()
    },
    async updateMessages() {
      if (this.currentTopic) {
        this.messages = await window.api.characterManager.ipcGetMessagesByTopicId(
          this.currentTopic.id,
        )
      } else {
        this.messages = []
      }
    },
  },
})

window.ipcRenderer.on('chat:characterUpdated', async () => {
  const chatStore = useChatStore()
  await chatStore.updateCharacters()
  await chatStore.updateTopics()
  await chatStore.updateMessages()
})

window.ipcRenderer.on('chat:topicUpdated', async () => {
  const chatStore = useChatStore()
  await chatStore.updateTopics()
  await chatStore.updateMessages()
})

window.ipcRenderer.on('chat:messageUpdated', async () => {
  const chatStore = useChatStore()
  await chatStore.updateMessages()
})
