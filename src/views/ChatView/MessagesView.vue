<template>
  <ScrollView class="full-height" padding="0 4px 10px 4px" gap="8px">
    <template v-if="chatStore.getCharacters.length === 0">
      <div class="no-select character_empty">
        <SVGFriendsEmptyPlaceholder width="8rem" height="8rem" color="#00000012" />
        <div>没有最近消息</div>
      </div>
    </template>
    <template v-else>
      <FriendItem
        v-for="(character, index) in chatStore.getCharacters"
        :key="index"
        avatar="/images/avatar.png"
        :name="character.name"
        :on="chatStore.getCurrentCharacter?.id === character.id"
        @click="selectCharacter(character)"
      />
    </template>
  </ScrollView>
</template>

<script setup lang="ts" name="MessagesView">
// SVG
import SVGFriendsEmptyPlaceholder from '@/svg/SVGFriendsEmptyPlaceholder.vue'
// Components
import ScrollView from '@/components/General/ScrollView.vue'
import FriendItem from '@/components/ChatView/FriendItem.vue'
// Scripts
import { Character, Topic } from '&/character'
// Pinia
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()

async function selectCharacter(character: Character | null) {
  if (!character) return

  const foundTopic =
    (await window.api.characterManager.ipcGetTopicById(`default-${character.id}`)) || null
  await chatStore.setCurrentCharacter(character)
  selectTopic(foundTopic)
}

async function selectTopic(topic: Topic | null) {
  await chatStore.setCurrentTopic(topic)
}
</script>

<style scoped>
.character_empty {
  width: 100%;
  height: calc(100vh - var(--title-bar-height) - 1px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #00000032;
  gap: 1rem;
}
</style>
