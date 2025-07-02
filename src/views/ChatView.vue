<template>
  <div class="character_view_container">
    <div class="character_list">
      <TitleBarPadding />
      <ScrollView class="full-height" padding-left-right="4px" gap="8px">
        <template v-if="currentTab === 0">
          <template v-if="characters.length === 0">
            <div class="no-select character_empty">
              <SVGFriendsEmptyPlaceholder width="8rem" height="8rem" color="#00000012" />
              <div>没有角色，点击右上角创建</div>
            </div>
          </template>
          <template v-else>
            <FriendItem
              v-for="(character, index) in characters"
              :key="index"
              avatar="/images/avatar.png"
              :name="character.name"
              :on="currentCharacter?.id === character.id"
              @click="selectCharacter(character)"
              @contextmenu="onCharacterRightClick($event, character.id)"
            />
            <ContextMenu
              ref="characterRightMenu"
              :model="characterRightMenuItems"
              @hide="rightClickedCharacterId = null"
            />
          </template>
        </template>
        <template v-if="currentTab === 1">
          <template v-if="topics.length === 0">
            <div class="no-select character_empty">
              <SVGTopicsEmptyPlaceholder width="8rem" height="8rem" color="#00000012" />
              <div>没有会话，点击右上角开启新会话</div>
            </div>
          </template>
          <template v-else>
            <FriendItem
              v-for="(topic, index) in topics"
              :key="index"
              :name="topic.name"
              :on="currentTopic?.id === topic.id"
              @click="selectTopic(topic)"
              @contextmenu="onTopicRightClick($event, topic.id)"
            />
            <ContextMenu
              ref="topicRightMenu"
              :model="topicRightMenuItems"
              @hide="rightClickedTopicId = null"
            />
          </template>
        </template>
      </ScrollView>
    </div>
    <div class="chat_area">
      <TitleBarPadding />
      <div v-if="currentTopic" class="chat_header" ref="chatHeader">
        <div class="chat_header_title">
          <span v-if="currentCharacter" class="character_name">{{ currentCharacter.name }}</span>
          <span v-if="currentTopic" class="topic_name">
            : {{ currentTopic.name ?? currentTopic.id }}</span
          >
        </div>
        <Select
          v-model="currentModel"
          :options="providers"
          option-group-label="name"
          option-label="id"
          option-group-children="models"
          filter
          checkmark
          size="small"
          scroll-height="28rem"
          placeholder="选择模型"
          empty-message="没有配置任何模型，请前往&quot设置>模型设置&quot配置API Key，或使用本地模型"
          empty-filter-message="没有结果"
        >
          <template #optiongroup="slotGroup">
            <div class="row-flex center-vertical">
              <img :src="slotGroup.option.icon" class="model_icon no-drag" />
              <div>{{ slotGroup.option.name }}</div>
            </div>
          </template>
          <template #value="slotProps">
            <div v-if="slotProps.value">
              <div class="row-flex center-vertical">
                <img
                  :src="providerManager.getProvider(slotProps.value.provider)?.icon"
                  class="model_icon small no-drag"
                />
                <div>
                  {{ beautifyModelName(slotProps.value.id) }}
                </div>
              </div>
            </div>
            <span v-else>
              {{ slotProps.placeholder }}
            </span>
          </template>
          <template #option="slotProps">
            <div>
              {{ beautifyModelName(slotProps.option.id) }}
            </div>
          </template>
        </Select>
      </div>
      <ScrollView ref="chatBoxScroll" style="height: 100%">
        <div class="chat_box_container" ref="chatBoxContainer">
          <template v-for="(message, index) in messages" :key="index">
            <template v-for="(msg, i) in <Array<UserMessage>>JSON.parse(message.content)" :key="i">
              <div v-if="message.role === 'user'" class="bubble_container user">
                <MarkdownArea :markdown="msg.message" :message-id="message.id" />
              </div>
            </template>
            <template
              v-for="(msg, i) in <Array<CharacterMessage>>JSON.parse(message.content)"
              :key="i"
            >
              <div v-if="message.role === 'assistant'" class="bubble_container assistant">
                <MarkdownArea :markdown="msg.message" :message-id="message.id" />
              </div>
            </template>
          </template>
        </div>
      </ScrollView>
      <div v-if="currentTopic" class="input_box_container" ref="chatInputBox">
        <InputArea v-model="inputContent" placeholder="在这里输入消息..." />
        <div class="input_box_buttons">
          <div class="input_box_button_group left"></div>
          <div class="input_box_button_group right">
            <InputBoxButton @click="sendMessage">
              <svg
                t="1747745327830"
                class="icon"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="9544"
                width="100%"
              >
                <path
                  d="M512 144a48 48 0 0 1 47.552 41.472L560 192v640a48 48 0 0 1-95.552 6.528L464 832V192A48 48 0 0 1 512 144z"
                  fill="#4C4B4C"
                  p-id="9545"
                ></path>
                <path
                  d="M478.08 158.08a48 48 0 0 1 62.464-4.672l5.376 4.672 288 288a48 48 0 0 1-62.464 72.512l-5.376-4.672L512 259.904l-254.08 254.08a48 48 0 0 1-62.464 4.608L190.08 513.92a48 48 0 0 1-4.672-62.464l4.672-5.376 288-288z"
                  fill="#4C4B4C"
                  p-id="9546"
                ></path>
              </svg>
            </InputBoxButton>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Character Creation Popup -->
  <Dialog
    v-model:visible="showCreateCharacterDialog"
    modal
    header="创建角色"
    :style="{ width: '50rem' }"
    :draggable="false"
  >
    <div class="create_form">
      <div class="field">
        <label for="characterName">名称</label>
        <InputText
          id="characterName"
          v-model="newCharacterForm.name"
          placeholder="请输入智能体名称"
          style="width: 100%"
        />
      </div>
      <div class="field">
        <label for="characterPrompt">提示词</label>
        <Textarea
          id="characterPrompt"
          v-model="newCharacterForm.prompt"
          placeholder="请输入智能体的提示词"
          rows="10"
          style="width: 100%"
        />
      </div>
    </div>
    <template #footer>
      <Button label="取消" severity="secondary" @click="showCreateCharacterDialog = false" />
      <Button label="确定" @click="confirmCreateCharacter" />
    </template>
  </Dialog>

  <TitleBarArea>
    <TitleBarSection left width="10rem">
      <TitleBarButton square @click="handleBack" v-if="currentTab !== 0">
        <SVGBack width="64%" height="64%" />
      </TitleBarButton>
    </TitleBarSection>
    <TitleBarSection right width="10rem">
      <TitleBarButton square @click="createCharacter" v-if="currentTab === 0">
        <SVGAdd width="90%" height="90%" />
      </TitleBarButton>
      <TitleBarButton square @click="addTopic" v-if="currentTab === 1">
        <SVGAdd width="90%" height="90%" />
      </TitleBarButton>
    </TitleBarSection>
    <TitleBarSection right>
      <TitleBarButton @click="hideTitleAndInputBox">
        <SVGFullscreen width="15" height="15" />
      </TitleBarButton>
      <TitleBarButton @click="expandChatArea">
        <SVGExpandHorizontal width="15" height="15" />
      </TitleBarButton>
    </TitleBarSection>
  </TitleBarArea>
</template>

<script setup lang="ts" name="MainChatView">
// VUE
import { computed, nextTick, onBeforeMount, onMounted, ref, toRaw, watch } from 'vue'
// SVG
import SVGFullscreen from '@/svg/SVGFullscreen.vue'
import SVGExpandHorizontal from '@/svg/SVGExpandHorizontal.vue'
import SVGBack from '@/svg/SVGBack.vue'
import SVGAdd from '@/svg/SVGAdd.vue'
import SVGFriendsEmptyPlaceholder from '@/svg/SVGFriendsEmptyPlaceholder.vue'
import SVGTopicsEmptyPlaceholder from '@/svg/SVGTopicsEmptyPlaceholder.vue'
// Components
import InputBoxButton from '@/components/ChatView/InputBoxButton.vue'
import ScrollView from '@/components/General/ScrollView.vue'
import InputArea from '@/components/General/InputArea.vue'
import MarkdownArea from '@/components/General/MarkdownArea.vue'
import TitleBarPadding from '@/components/Window/TitleBarPadding.vue'
import TitleBarArea from '@/components/Window/TitleBarArea.vue'
import TitleBarSection from '@/components/Window/TitleBarSection.vue'
import TitleBarButton from '@/components/Window/TitleBarButton.vue'
import FriendItem from '@/components/ChatView/FriendItem.vue'
// Scripts
import characterManager, { type Character, type Topic } from '@/scripts/store/characterManager'
import { CharacterMessage, OpenAIChat, UserMessage, type Message } from '@/scripts/service/chat'
import uuid from '@/scripts/utils/uuid'
import providerManager from '@/scripts/store/providerManager'
import beautifyModelName from '@/scripts/utils/beautifyModelName'
import type { Model } from '@/config/providers'
// PrimeVue
import { Select, useToast } from 'primevue'
import ContextMenu from 'primevue/contextmenu'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import { chatAndAutoSchedule } from '@/scripts/service/initiativeChatTask'
const toast = useToast()

const currentTab = ref(-1)

const characters = ref<Character[]>([])
const topics = ref<Topic[]>([])

const currentCharacter = ref<Character | null>(null)
const currentTopic = ref<Topic | null>(null)
const messages = ref<Message[]>([])
const inputContent = ref('')

const providers = providerManager
  .getAllProviders()
  .filter((provider) => provider.models?.length !== 0)

// Character creation
const showCreateCharacterDialog = ref(false)
const newCharacterForm = ref({
  name: '',
  prompt: '',
})

function createCharacter() {
  newCharacterForm.value = {
    name: '',
    prompt: '',
  }
  showCreateCharacterDialog.value = true
}

async function confirmCreateCharacter() {
  if (!newCharacterForm.value.name.trim()) {
    toast.add({
      severity: 'warn',
      summary: '请输入智能体名称',
      life: 3000,
    })
    return
  }

  if (!newCharacterForm.value.prompt.trim()) {
    toast.add({
      severity: 'warn',
      summary: '请输入智能体提示词',
      detail: '',
      life: 3000,
    })
    return
  }

  try {
    const newCharacter = {
      id: uuid(),
      name: newCharacterForm.value.name,
      prompt: newCharacterForm.value.prompt,
      topics: [],
    }

    await characterManager.addOrUpdateCharacter(newCharacter)
    characters.value = await characterManager.getAllCharacters()

    showCreateCharacterDialog.value = false

    toast.add({
      severity: 'success',
      summary: '创建成功',
      life: 3000,
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: '创建失败',
      detail: (error as Error).message,
      life: 3000,
    })
  }
}

// Chat
async function addTopic() {
  if (!currentCharacter.value) return

  const newTopic: Topic = {
    id: uuid(),
    name: '新话题',
    messages: [],
  }

  await characterManager.addTopicToCharacter(currentCharacter.value.id, newTopic)

  topics.value = await characterManager.getTopicsByCharacterId(currentCharacter.value.id)
  await selectTopic(newTopic)
  selectFunctionTab(1)
}

async function sendMessage() {
  // Check whether input message is empty
  if (!inputContent.value.trim()) return

  // Ensure a topic is selected, if not, create a new one
  if (!currentTopic.value) {
    await addTopic()
  }

  if (!currentTopic.value) {
    return
  }

  if (!currentChat.value) {
    return
  }

  try {
    scrollToBottom()
    const currentInput = inputContent.value
    inputContent.value = ''
    await chatAndAutoSchedule(
      currentChat.value,
      currentCharacter.value.id,
      currentTopic.value.id,
      currentInput,
    )
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: '发送失败',
      detail: (error as Error).message,
    })
  }
}

// Selection
const currentModel = ref<Model | null>(null)
const currentChat = computed(() => {
  if (!currentModel.value) {
    return null
  }

  const provider = providerManager.getProvider(currentModel.value.provider) || null

  if (!provider) {
    return null
  }

  return new OpenAIChat(provider.url, provider.apiKey || '', currentModel.value.id, 1, {
    type: 'json_object',
  })
})

function handleBack() {
  selectFunctionTab(0)
}

function selectFunctionTab(index: number) {
  if (index === 1 && currentCharacter.value === null) {
    return
  }

  currentTab.value = index
}

async function selectCharacter(character: Character | null) {
  if (toRaw(currentCharacter.value)?.id === toRaw(character)?.id) {
    selectFunctionTab(1)
    return
  }

  currentCharacter.value = character
  selectTopic(null)
  if (character) {
    topics.value = await characterManager.getTopicsByCharacterId(character.id)
  }
}

async function selectTopic(topic: Topic | null) {
  currentTopic.value = topic
  if (topic) {
    messages.value = await characterManager.getMessagesByTopicId(topic.id)
    scrollToBottom()
  } else {
    messages.value = []
  }
}

// Right-click context menu
let rightClickedCharacterId: string | null = null
let rightClickedTopicId: string | null = null
const characterRightMenu = ref<InstanceType<typeof ContextMenu> | null>(null)
const topicRightMenu = ref<InstanceType<typeof ContextMenu> | null>(null)

const characterRightMenuItems = ref([
  {
    label: '删除',
    command: async () => {
      try {
        if (!rightClickedCharacterId) {
          throw new Error('未选择智能体')
        }

        await characterManager.deletecharacter(rightClickedCharacterId)

        characters.value = await characterManager.getAllCharacters()
        selectFunctionTab(0)
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: '删除失败',
          detail: (error as Error).message,
        })
      } finally {
        selectCharacter(null)
      }
    },
  },
])

const topicRightMenuItems = ref([
  {
    label: '删除',
    command: async () => {
      try {
        if (!currentCharacter.value) {
          throw new Error('未选择智能体')
        }

        if (!rightClickedTopicId) {
          throw new Error('未选择话题')
        }

        await characterManager.deleteTopicFromCharacter(
          currentCharacter.value.id,
          rightClickedTopicId,
        )

        topics.value = await characterManager.getTopicsByCharacterId(currentCharacter.value.id)
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: '删除失败',
          detail: (error as Error).message,
        })
      } finally {
        await selectTopic(null)
      }
    },
  },
])

function onCharacterRightClick(event: MouseEvent, characterId: string) {
  rightClickedCharacterId = characterId
  characterRightMenu.value?.show(event)
}

function onTopicRightClick(event: MouseEvent, topicId: string) {
  rightClickedTopicId = topicId
  topicRightMenu.value?.show(event)
}

// Expand and scroll chat area
const chatHeader = ref<HTMLDivElement | null>(null)
const chatInputBox = ref<HTMLDivElement | null>(null)
const chatBoxContainer = ref<HTMLDivElement | null>(null)
const chatBoxScroll = ref<InstanceType<typeof ScrollView> | null>(null)

function expandChatArea() {
  chatBoxContainer.value?.classList.toggle('expanded')
}

function hideTitleAndInputBox() {
  chatHeader.value?.classList.toggle('hide')
  chatInputBox.value?.classList.toggle('hide')
}

function scrollToBottom() {
  nextTick(() => {
    chatBoxScroll.value?.scrollToBottom()
  })
}

// Save selection history
function saveCharacterTopicHistory() {
  localStorage.setItem(
    'user.chat.selected',
    JSON.stringify({
      character: currentCharacter.value?.id || null,
      topic: currentTopic.value?.id || null,
    }),
  )
}

async function loadCharacterTopicHistory() {
  const savedData = localStorage.getItem('user.chat.selected')
  let tab = 0
  if (savedData) {
    const { character } = JSON.parse(savedData)

    if (character) {
      const foundCharacter = await characterManager.getCharacterById(character)
      if (foundCharacter) {
        await selectCharacter(foundCharacter)
      }
    }
  }

  selectFunctionTab(tab)
}

const onMessageAdded = (topicId: string, newMessage: Message) => {
  if (currentTopic.value && topicId === currentTopic.value.id) {
    messages.value.push(newMessage)
    if (chatBoxScroll.value?.isAtBottom()) {
      scrollToBottom()
    }
  }
}

const onMessageUpdated = (topicId: string, updatedMessage: Message) => {
  if (currentTopic.value && topicId === currentTopic.value.id) {
    const index = messages.value.findIndex((msg) => msg.id === updatedMessage.id)
    if (index !== -1) {
      messages.value[index] = updatedMessage
      if (chatBoxScroll.value?.isAtBottom()) {
        scrollToBottom()
      }
    }
  }
}

onMounted(() => {
  characterManager.addOnMessageAddedListener(onMessageAdded)
  characterManager.addOnMessageUpdatedListener(onMessageUpdated)
})

onBeforeMount(() => {
  characterManager.removeOnMessageAddedListener(onMessageAdded)
  characterManager.removeOnMessageUpdatedListener(onMessageUpdated)
})

onMounted(async () => {
  characters.value = await characterManager.getAllCharacters()
  topics.value = []

  await loadCharacterTopicHistory()

  const selectedModelId = localStorage.getItem('user.chat.selected.model')
  if (selectedModelId) {
    const model = providerManager.getAllModels().find((m) => m.id === selectedModelId)
    if (model) {
      currentModel.value = model
    }
  } else {
    currentModel.value = providerManager.getAllModels()[0] || null
  }
})

watch([currentCharacter, currentTopic], () => {
  saveCharacterTopicHistory()
})

watch(currentModel, (newModel) => {
  if (newModel) {
    localStorage.setItem('user.chat.selected.model', newModel.id)
  } else {
    localStorage.removeItem('user.chat.selected.model')
  }
})
</script>

<style scoped>
.character_view_container {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
}

.character_list {
  width: 20rem;
  min-width: 20rem;
  max-width: 20rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;

  border-right: var(--default-border-1);
}

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

.chat_box_container {
  margin: 0 auto;
  width: 100%;
  max-width: 900px;
  box-sizing: border-box;
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: max-width 0.2s ease-in-out;

  &.expanded {
    max-width: 100%;
  }
}

.chat_area {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat_header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: var(--default-border-1);
  padding: 0 22px 12.5px 22px;
}

.chat_header_title {
  & .character_name {
    font-size: 1.25rem;
    font-weight: bold;
    padding-right: 2px;
  }

  & .topic_name {
    color: #888888;
  }
}

.model_icon {
  width: 36px;
  height: 36px;
  margin-right: 14px;
  border-radius: 8px;
  border: var(--default-border-1);
  display: flex;

  &.small {
    width: 22px;
    height: 22px;
    margin-right: 8px;
  }
}

.bubble_container {
  padding: 16px;
  width: fit-content;
  box-shadow: 0 4px 12px #00000014;

  &.assistant {
    border-radius: 0 20px 20px 20px;
    border: solid 2px var(--theme-orange);
    background-color: var(--theme-orange-1);
    align-self: flex-start;
    margin-right: 64px;
  }

  &.user {
    border-radius: 20px 0 20px 20px;
    border: solid 2px var(--theme-blue);
    background-color: var(--theme-blue-1);
    align-self: flex-end;
    margin-left: 64px;
  }
}

.input_box_container {
  display: grid;
  grid-template-rows: 1fr auto;
  min-height: 150px;
  max-height: 250px;
  box-sizing: border-box;
  border-top: var(--default-border-1);
}

.input_box_buttons {
  width: 100%;
  min-height: 50px;
  display: flex;
}

.input_box_button_group {
  height: 100%;
  display: flex;
  flex-grow: 1;
  align-items: center;
  gap: 8px;
  padding: 0 15px;
  box-sizing: border-box;

  &.left {
    justify-content: left;
  }

  &.right {
    justify-content: right;
  }
}

.create_form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field label {
  font-weight: 600;
  color: #333;
}
</style>
