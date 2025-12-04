<template>
  <div class="character_view_container">
    <div class="character_list">
      <TitleBarPadding />
      <AnimatedRouterView :level="1" />
    </div>
    <div class="chat_area">
      <TitleBarPadding />
      <div v-if="chatStore.getCurrentTopic" class="chat_header" ref="chatHeader">
        <div class="chat_header_title">
          <span v-if="chatStore.getCurrentCharacter" class="character_name">
            {{ chatStore.getCurrentCharacter.name }}
          </span>
          <span v-if="!isDefaultTopic" class="topic_name">
            : {{ chatStore.getCurrentTopic.name ?? chatStore.getCurrentTopic.id }}
          </span>
        </div>
        <Select
          v-model="currentModel"
          v-if="!isDefaultTopic"
          :options="providersWithModels"
          option-group-label="provider"
          option-label="id"
          option-group-children="models"
          filter
          checkmark
          size="small"
          scroll-height="28rem"
          placeholder="选择模型"
          empty-message='没有配置任何模型，请前往"设置&gt;模型设置"配置API Key，或使用本地模型'
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
                  :src="providers.find((p) => p.id === slotProps.value.provider)?.icon"
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
          <template v-for="(message, index) in chatStore.getMessages" :key="index">
            <template v-for="(msg, i) in <Array<UserMessage>>JSON.parse(message.content)" :key="i">
              <div v-if="message.role === 'user'" class="bubble_container user">
                <MarkdownArea
                  :markdown="msg.message"
                  @think-collapse="handleCollapseThink($event, message.id)"
                />
              </div>
            </template>
            <template
              v-for="(msg, i) in <Array<CharacterMessage>>JSON.parse(message.content)"
              :key="i"
            >
              <div v-if="message.role === 'assistant'" class="bubble_container assistant">
                <MarkdownArea
                  :markdown="msg.message"
                  @think-collapse="handleCollapseThink($event, message.id)"
                />
              </div>
            </template>
          </template>
        </div>
      </ScrollView>
      <div v-if="chatStore.getCurrentTopic" class="input_box_container" ref="chatInputBox">
        <InputArea
          v-model="inputContent"
          placeholder="在这里输入消息..."
          padding="1rem calc(1rem - var(--scroll-bar-width))"
          minHeight="98px"
        />
        <div class="input_box_buttons">
          <div class="input_box_button_group left"></div>
          <div class="input_box_button_group right">
            <InputBoxButton @click="sendMessage">
              <SVGSend width="75%" height="75%" color="#ffffff" />
            </InputBoxButton>
          </div>
        </div>
      </div>
    </div>
  </div>

  <TitleBarArea>
    <TitleBarSection right>
      <TitleBarButton v-if="chatStore.getCurrentTopic" @click="hideTitleAndInputBox">
        <SVGFullscreen width="15" height="15" />
      </TitleBarButton>
      <TitleBarButton v-if="chatStore.getCurrentTopic" @click="expandChatArea">
        <SVGExpandHorizontal width="15" height="15" />
      </TitleBarButton>
    </TitleBarSection>
  </TitleBarArea>
</template>

<script setup lang="ts" name="MainChatView">
// VUE
import { computed, nextTick, onMounted, ref, watch } from 'vue'
// SVG
import SVGSend from '@/svg/SVGSend.vue'
import SVGFullscreen from '@/svg/SVGFullscreen.vue'
import SVGExpandHorizontal from '@/svg/SVGExpandHorizontal.vue'
// Components
import InputArea from '@/components/General/InputArea.vue'
import ScrollView from '@/components/General/ScrollView.vue'
import TitleBarArea from '@/components/Window/TitleBarArea.vue'
import MarkdownArea from '@/components/General/MarkdownArea.vue'
import TitleBarButton from '@/components/Window/TitleBarButton.vue'
import InputBoxButton from '@/components/ChatView/InputBoxButton.vue'
import TitleBarPadding from '@/components/Window/TitleBarPadding.vue'
import TitleBarSection from '@/components/Window/TitleBarSection.vue'
import AnimatedRouterView from '@/components/Window/AnimatedRouterView.vue'
// Scripts
import { Model } from '&/provider'
import { CharacterMessage, UserMessage } from '&/chat'
import beautifyModelName from '&/utils/beautifyModelName'
// PrimeVue
import { Select, useToast } from 'primevue'
// Pinia
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()
const toast = useToast()

const isDefaultTopic = computed(() => {
  return chatStore.getCurrentTopic?.id === `default-${chatStore.getCurrentCharacter?.id}`
})

const inputContent = ref('')

const providers = await window.api.providerManager.ipcGetAllProviders()
const models = await window.api.providerManager.ipcGetAllModels()
const providersWithModels = providers.map((provider) => {
  return {
    ...provider,
    models: models.filter((model) => model.provider === provider.id),
  }
})

// Chat
async function sendMessage() {
  // Check whether input message is empty
  if (!inputContent.value.trim()) return

  // Ensure a character and topic are selected
  if (!chatStore.getCurrentCharacter || !chatStore.getCurrentTopic) return

  // Ensure a model is selected
  if (!currentModel.value) return

  try {
    scrollToBottom()
    const currentInput = inputContent.value
    inputContent.value = ''

    const provider = providers.find((p) => p.id === currentModel.value?.provider)
    await window.api.proactiveChat.ipcChatAndAutoSchedule(
      {
        apiURL: provider?.url || '',
        apiKey: provider?.apiKey || '',
        model: currentModel.value?.id || '',
        temperature: 1,
        json: { type: 'json_object' },
      },
      chatStore.getCurrentCharacter.id,
      chatStore.getCurrentTopic.id,
      currentInput,
    )
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: '发送失败',
      detail: (error as Error).message,
    })
    console.error('发送失败:', error)
  }
}

// Selection
const currentModel = ref<Model | null>(null)

/** Think is not supported currently **/
async function handleCollapseThink(event: Event, messageId: string) {
  const currentTarget = event.currentTarget as HTMLElement | null
  const thinkElement = currentTarget?.closest('think')

  if (thinkElement) {
    await window.api.characterManager.ipcGetMessageById(messageId).then((message) => {
      if (message) {
        message.thinkCollapsed = !thinkElement.classList.contains('collapsed')
        window.api.characterManager.ipcAddOrUpdateMessage(message)

        const thinkElements = currentTarget?.querySelectorAll('think')
        thinkElements?.forEach(async (thinkElement) => {
          thinkElement.classList.remove('no-animation')
        })
      }
    })

    thinkElement.classList.toggle('collapsed')
  }
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

// Init
onMounted(async () => {
  await chatStore.updateCharacters()

  // Load selected model
  const selectedModelId = localStorage.getItem('user.chat.selected.model')
  if (selectedModelId) {
    const model = (await window.api.providerManager.ipcGetAllModels()).find(
      (m) => m.id === selectedModelId,
    )
    if (model) {
      currentModel.value = model
    }
  } else {
    currentModel.value = (await window.api.providerManager.ipcGetAllModels())[0] || null
  }
})

// Remember selected model
// TODO: Remember model for each character and topic
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
  padding: 0 12.5px 12.5px 22px;
  min-height: 48.5px;
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
</style>
