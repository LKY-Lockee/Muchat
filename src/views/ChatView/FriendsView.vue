<template>
  <ScrollView class="full-height" padding="0 4px 10px 4px" gap="8px">
    <template v-if="currentTab === 'character'">
      <template v-if="chatStore.getCharacters.length === 0">
        <div class="no-select character_empty">
          <SVGFriendsEmptyPlaceholder width="8rem" height="8rem" color="#00000012" />
          <div>没有角色，点击右上角创建</div>
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
          @contextmenu="onCharacterRightClick($event, character.id)"
        />
        <ContextMenu
          ref="characterRightMenu"
          :model="characterRightMenuItems"
          @hide="rightClickedCharacterId = null"
        />
      </template>
    </template>
    <template v-if="currentTab === 'topic'">
      <template v-if="chatStore.getTopics.length === 0">
        <div class="no-select character_empty">
          <SVGTopicsEmptyPlaceholder width="8rem" height="8rem" color="#00000012" />
          <div>没有会话，点击右上角开启新会话</div>
        </div>
      </template>
      <template v-else>
        <FriendItem
          v-for="(topic, index) in chatStore.getTopics"
          :key="index"
          :name="topic.name"
          :on="chatStore.getCurrentTopic?.id === topic.id"
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

  <!-- Character Creation Popup -->
  <Dialog
    v-model:visible="showCreateCharacterDialog"
    modal
    :header="characterDialogTitle"
    :style="{ width: '90vw' }"
    :draggable="false"
  >
    <FormView>
      <FormField>
        <label for="characterName">名称</label>
        <InputText
          id="characterName"
          v-model="newCharacterForm.name"
          placeholder="请输入角色名称"
          style="width: 100%"
        />
      </FormField>
      <FormField>
        <label for="characterPrompt">提示词</label>
        <Textarea
          id="characterPrompt"
          v-model="newCharacterForm.prompt"
          placeholder="请输入角色提示词"
          rows="10"
          style="width: 100%"
        />
      </FormField>
    </FormView>
    <template #footer>
      <Button label="取消" severity="secondary" @click="showCreateCharacterDialog = false" />
      <Button label="确定" @click="confirmCreateCharacter" />
    </template>
  </Dialog>

  <!-- Memory Viewer Dialog -->
  <Dialog
    v-model:visible="showMemoryDialog"
    modal
    header="记忆"
    :style="{ width: '90vw' }"
    :draggable="false"
  >
    <DataTable
      :value="memoryData"
      :loading="loadingMemories"
      scrollable
      scroll-height="60vh"
      striped-rows
      paginator
      :rows="10"
      :rows-per-page-options="[10, 25, 50]"
    >
      <Column field="id" header="ID" style="min-width: 150px" />
      <Column field="memory" header="记忆内容" sortable style="min-width: 400px" />
      <Column field="agentId" header="Agent ID" style="min-width: 150px" />
      <Column field="userId" header="User ID" sortable style="min-width: 150px" />
      <Column field="createdAt" header="创建时间" sortable style="min-width: 180px">
        <template #body="{ data }">
          <div>{{ formatDate(data.createdAt) }}</div>
        </template>
      </Column>
      <Column field="updatedAt" header="更新时间" sortable style="min-width: 180px">
        <template #body="{ data }">
          <div>{{ formatDate(data.updatedAt) }}</div>
        </template>
      </Column>
      <Column field="hash" header="Hash" style="min-width: 50px" />
      <Column field="metadata" header="元数据" style="min-width: 200px">
        <template #body="{ data }">
          <div>{{ formatMetadata(data.metadata) }}</div>
        </template>
      </Column>
    </DataTable>
  </Dialog>

  <TitleBarArea>
    <TitleBarSection left width="10rem">
      <TitleBarButton square @click="selectTab('character')" v-if="currentTab !== 'character'">
        <SVGBack width="64%" height="64%" />
      </TitleBarButton>
    </TitleBarSection>
    <TitleBarSection right width="10rem">
      <TitleBarButton square @click="createCharacter" v-if="currentTab === 'character'">
        <SVGAdd width="90%" height="90%" />
      </TitleBarButton>
      <TitleBarButton square @click="addTopic" v-if="currentTab === 'topic'">
        <SVGAdd width="90%" height="90%" />
      </TitleBarButton>
    </TitleBarSection>
  </TitleBarArea>
</template>

<script setup lang="ts" name="FriendsView">
// VUE
import { onMounted, ref, toRaw, watch } from 'vue'
// SVG
import SVGAdd from '@/svg/SVGAdd.vue'
import SVGBack from '@/svg/SVGBack.vue'
import SVGTopicsEmptyPlaceholder from '@/svg/SVGTopicsEmptyPlaceholder.vue'
import SVGFriendsEmptyPlaceholder from '@/svg/SVGFriendsEmptyPlaceholder.vue'
// Components
import FormView from '@/components/General/FormView.vue'
import FormField from '@/components/General/FormField.vue'
import ScrollView from '@/components/General/ScrollView.vue'
import FriendItem from '@/components/ChatView/FriendItem.vue'
import TitleBarArea from '@/components/Window/TitleBarArea.vue'
import TitleBarButton from '@/components/Window/TitleBarButton.vue'
import TitleBarSection from '@/components/Window/TitleBarSection.vue'
// Scripts
import uuid from '&/utils/uuid'
import { Character, Topic } from '&/character'
import { MemoryItem } from 'mem0ai-nosqlite/oss'
// PrimeVue
import { MenuItem } from 'primevue/menuitem'
import {
  Button,
  ContextMenu,
  Dialog,
  InputText,
  Textarea,
  useToast,
  DataTable,
  Column,
} from 'primevue'
// Pinia
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()
const toast = useToast()

const currentTab = ref<'character' | 'topic'>('character')

// Character creation
const showCreateCharacterDialog = ref(false)
const characterDialogTitle = ref('创建角色')
const newCharacterForm = ref({
  id: '',
  name: '',
  prompt: '',
})

// Memory viewer
const showMemoryDialog = ref(false)
const memoryData = ref<MemoryItem[]>([])
const loadingMemories = ref(false)

function createCharacter() {
  newCharacterForm.value = {
    id: '',
    name: '',
    prompt: '',
  }
  characterDialogTitle.value = '创建角色'
  showCreateCharacterDialog.value = true
}

async function confirmCreateCharacter() {
  if (!newCharacterForm.value.name.trim()) {
    toast.add({
      severity: 'warn',
      summary: '请输入角色名称',
      life: 3000,
    })
    return
  }

  if (!newCharacterForm.value.prompt.trim()) {
    toast.add({
      severity: 'warn',
      summary: '请输入角色提示词',
      detail: '',
      life: 3000,
    })
    return
  }

  const isEdit = !!newCharacterForm.value.id

  try {
    const newCharacter = {
      id: isEdit ? newCharacterForm.value.id : uuid(),
      name: newCharacterForm.value.name,
      prompt: newCharacterForm.value.prompt,
      topics: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    await window.api.characterManager.ipcAddOrUpdateCharacter(newCharacter)

    showCreateCharacterDialog.value = false

    toast.add({
      severity: 'success',
      summary: isEdit ? '修改成功' : '创建成功',
      life: 3000,
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: isEdit ? '修改失败' : '创建失败',
      detail: (error as Error).message,
      life: 3000,
    })
  }
}

// Chat
async function addTopic() {
  if (!chatStore.getCurrentCharacter) return

  const newTopic: Topic = {
    id: uuid(),
    characterId: chatStore.getCurrentCharacter.id,
    name: '新话题',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  await window.api.characterManager.ipcAddOrUpdateTopic(newTopic)
  await selectTopic(newTopic)
  selectTab('topic')
}

// Selection
function selectTab(tabName: 'character' | 'topic') {
  if (tabName === 'topic' && chatStore.getCurrentCharacter === null) {
    return
  }

  currentTab.value = tabName
}

async function selectCharacter(character: Character | null) {
  if (toRaw(chatStore.getCurrentCharacter)?.id === toRaw(character)?.id) {
    selectTab('topic')
    return
  }

  await chatStore.setCurrentCharacter(character)
  selectTopic(null)
}

async function selectTopic(topic: Topic | null) {
  await chatStore.setCurrentTopic(topic)
}

// Right-click context menu
let rightClickedCharacterId: string | null = null
let rightClickedTopicId: string | null = null
const characterRightMenu = ref<InstanceType<typeof ContextMenu> | null>(null)
const topicRightMenu = ref<InstanceType<typeof ContextMenu> | null>(null)

const characterRightMenuItems = ref<MenuItem[]>([
  {
    label: '修改',
    command: () => {
      if (!rightClickedCharacterId) return

      const character = chatStore.getCharacters.find((c) => c.id === rightClickedCharacterId)
      if (character) {
        newCharacterForm.value = {
          id: character.id,
          name: character.name,
          prompt: character.prompt,
        }
        characterDialogTitle.value = '修改角色'
        showCreateCharacterDialog.value = true
      }
    },
  },
  {
    label: '查看记忆',
    command: async () => {
      try {
        if (!rightClickedCharacterId) return
        await viewMemories(`default-${rightClickedCharacterId}`)
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: '错误',
          detail: (error as Error).message,
        })
      }
    },
  },
  {
    label: '删除',
    command: async () => {
      try {
        if (!rightClickedCharacterId) return

        await window.api.characterManager.ipcDeleteCharacter(rightClickedCharacterId)
        selectTab('character')
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
    label: '查看记忆',
    command: async () => {
      try {
        if (!rightClickedTopicId) return
        await viewMemories(rightClickedTopicId)
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: '错误',
          detail: (error as Error).message,
        })
      }
    },
  },
  {
    label: '删除',
    command: async () => {
      try {
        if (!chatStore.getCurrentCharacter) {
          throw new Error('未选择角色')
        }

        if (!rightClickedTopicId) {
          throw new Error('未选择话题')
        }

        await window.api.characterManager.ipcDeleteTopic(
          chatStore.getCurrentCharacter.id,
          rightClickedTopicId,
        )
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

async function viewMemories(agentId: string) {
  loadingMemories.value = true
  showMemoryDialog.value = true
  memoryData.value = []

  try {
    const result = await window.api.memoryManager.ipcGetAllMemories({ agentId })
    memoryData.value = result.results || []
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: '加载记忆失败',
      detail: (error as Error).message,
    })
  } finally {
    loadingMemories.value = false
  }
}

function formatDate(timestamp: number | string) {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function formatMetadata(metadata: Record<string, unknown> | null | undefined) {
  if (!metadata) return '-'
  return JSON.stringify(metadata, null, 2)
}

function onCharacterRightClick(event: MouseEvent, characterId: string) {
  rightClickedCharacterId = characterId
  characterRightMenu.value?.show(event)
}

function onTopicRightClick(event: MouseEvent, topicId: string) {
  rightClickedTopicId = topicId
  topicRightMenu.value?.show(event)
}

// Save selection history
function saveCharacterTopicHistory() {
  localStorage.setItem(
    'user.friends.selected',
    JSON.stringify({
      character: chatStore.getCurrentCharacter?.id || null,
      topic: chatStore.getCurrentTopic?.id || null,
    }),
  )
}

async function loadCharacterTopicHistory() {
  const savedData = localStorage.getItem('user.friends.selected')
  if (savedData) {
    const { character, topic } = JSON.parse(savedData)

    if (character) {
      const foundCharacter = await window.api.characterManager.ipcGetCharacterById(character)
      if (foundCharacter) {
        await selectCharacter(foundCharacter)

        if (topic) {
          const foundTopic = await window.api.characterManager.ipcGetTopicById(topic)
          if (foundTopic) {
            await selectTopic(foundTopic)
          }
        }
      }
    }
  }

  selectTab('character')
}

// Init
onMounted(async () => {
  await loadCharacterTopicHistory()
})

// Remember selected character and topic
watch(
  () => [chatStore.getCurrentCharacter, chatStore.getCurrentTopic],
  () => {
    saveCharacterTopicHistory()
  },
)
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
