<template>
  <div class="models_settings">
    <div>
      <div class="models_sidebar">
        <div class="memory_model_container">
          <div
            class="provider_item no-select"
            :class="{ on: !selectedProvider }"
            @click="selectProvider(null)"
          >
            <SVGBrain width="2rem" height="2rem" />
            <div>记忆模型</div>
          </div>
        </div>
        <ScrollView class="providers" padding="15px 4px" gap="10px">
          <div
            v-for="provider in providersRef"
            :key="provider.id"
            class="provider_item no-select"
            :class="{ on: selectedProvider?.id === provider.id }"
            @click="selectProvider(provider.id)"
          >
            <img :src="provider.icon" class="provider_icon no-drag" />
            <div>{{ provider.name }}</div>
          </div>
        </ScrollView>
      </div>
    </div>
    <div class="models_content">
      <div class="content_header">
        <template v-if="selectedProvider">
          <h2>{{ selectedProvider.name }}</h2>
          <OpenLink
            v-if="selectedProvider.websites?.official"
            :href="selectedProvider.websites?.official"
            v-tooltip.bottom="{
              value: '打开官方网站',
              showDelay: 300,
              hideDelay: 300,
            }"
          />
        </template>
        <template v-else>
          <h2>记忆模型</h2>
        </template>
      </div>
      <ScrollView padding="24px 20px" gap="20px">
        <template v-if="selectedProvider">
          <Panel header="API 设置">
            <FormView>
              <FormField>
                <label for="apiKey" class="row-flex center-vertical gap-8">
                  API Key
                  <OpenLink
                    v-if="selectedProvider.websites?.apiKey"
                    :href="selectedProvider.websites?.apiKey"
                    v-tooltip.bottom="{
                      value: '打开API Key配置页面',
                      showDelay: 300,
                      hideDelay: 300,
                    }"
                    width="16"
                    height="16"
                  />
                </label>
                <InputGroup>
                  <Password v-model="selectedProvider.apiKey" :feedback="false" toggle-mask />
                  <InputGroupAddon>
                    <Button label="检测" @click="testConnection" />
                  </InputGroupAddon>
                </InputGroup>
              </FormField>
              <FormField>
                <label for="url">API 地址</label>
                <InputText v-model="selectedProvider.url" />
              </FormField>
            </FormView>
          </Panel>
          <Panel header="模型">
            <div class="models_grid">
              <div
                v-for="model in selectedProviderModels"
                :key="model.id"
                @contextmenu="onModelRightClick($event, model)"
                class="model_card"
              >
                <div class="model_header">
                  <h4 class="model_name">{{ model.id }}</h4>
                  <span
                    class="model_type"
                    :class="{
                      chat: model.type === 'chat',
                      reasoning: model.type === 'reasoning',
                      embedding: model.type === 'embedding',
                      other: model.type === 'other',
                    }"
                  >
                    {{ getModelTypeName(model) }}
                  </span>
                </div>
              </div>
            </div>
            <template #icons>
              <Button
                severity="secondary"
                rounded
                text
                style="padding: 0.5rem"
                @click="refreshModel"
                v-tooltip="{
                  value: '刷新模型列表',
                  showDelay: 300,
                  hideDelay: 300,
                }"
              >
                <SVGRefresh color="#64748B" width="22" height="22" />
              </Button>
            </template>
          </Panel>
        </template>
        <template v-else>
          <Panel header="向量数据库" toggleable>
            <FormView>
              <FormField>
                <label for="vectorStoreProvider">提供商</label>
                <Select
                  id="vectorStoreProvider"
                  :options="vectorStoreProviders"
                  v-model="memorySettings.vectorStore!.provider"
                />
              </FormField>
              <FormField>
                <label for="vectorStoreCollectionName">集合名称</label>
                <InputText
                  id="vectorStoreCollectionName"
                  v-model="memorySettings.vectorStore!.collectionName"
                />
              </FormField>
              <FormField>
                <label for="vectorStoreEmbeddingDims">嵌入维度</label>
                <InputNumber
                  id="vectorStoreEmbeddingDims"
                  type="number"
                  v-model="memorySettings.vectorStore!.dimension"
                />
              </FormField>
            </FormView>
          </Panel>
          <Panel header="嵌入模型" toggleable>
            <FormView>
              <FormField>
                <label for="embedderProvider">提供商</label>
                <Select
                  id="embedderProvider"
                  :options="embedderProviders"
                  v-model="memorySettings.embedder!.provider"
                />
              </FormField>
              <FormField>
                <label for="embedderAPIKey">API Key</label>
                <Password
                  id="embedderAPIKey"
                  :feedback="false"
                  toggle-mask
                  v-model="memorySettings.embedder!.apiKey"
                />
              </FormField>
              <FormField>
                <label for="embedderURL">API 地址</label>
                <InputText id="embedderURL" v-model="memorySettings.embedder!.baseURL" />
              </FormField>
              <FormField>
                <label for="embedderModel">模型 ID</label>
                <InputText id="embedderModel" v-model="memorySettings.embedder!.model" />
              </FormField>
            </FormView>
          </Panel>
          <Panel header="LLM模型" toggleable>
            <FormView>
              <FormField>
                <label for="llmProvider">提供商</label>
                <Select
                  id="llmProvider"
                  :options="llmProviders"
                  v-model="memorySettings.llm!.provider"
                />
              </FormField>
              <FormField>
                <label for="llmAPIKey">API Key</label>
                <Password
                  id="llmAPIKey"
                  :feedback="false"
                  toggle-mask
                  v-model="memorySettings.llm!.apiKey"
                />
              </FormField>
              <FormField>
                <label for="llmURL">API 地址</label>
                <InputText id="llmURL" v-model="memorySettings.llm!.baseURL" />
              </FormField>
              <FormField>
                <label for="llmModel">模型 ID</label>
                <InputText id="llmModel" v-model="memorySettings.llm!.model" />
              </FormField>
            </FormView>
          </Panel>
          <Panel header="历史设置" toggleable>
            <FormView>
              <FormField direction="row">
                <label for="historyDisabled">禁用历史记录</label>
                <ToggleSwitch id="historyDisabled" v-model="memorySettings.disableHistory" />
              </FormField>
              <FormField>
                <label for="historyProvider">提供商</label>
                <Select
                  id="historyProvider"
                  :options="historyProviders"
                  v-model="memorySettings.historyStore!.provider"
                />
              </FormField>
            </FormView>
          </Panel>
          <Panel header="Graph 设置" toggleable>
            <FormView>
              <FormField direction="row">
                <label for="graphEnabled">启用 Graph</label>
                <ToggleSwitch id="graphEnabled" v-model="memorySettings.enableGraph" />
              </FormField>
              <FormField>
                <label for="graphProvider">提供商</label>
                <Select
                  id="graphProvider"
                  :options="graphProviders"
                  v-model="memorySettings.graphStore!.provider"
                />
              </FormField>
            </FormView>
          </Panel>
          <Panel header="其他设置" toggleable>
            <FormView>
              <FormField>
                <label for="customPrompt">自定义提示词</label>
                <Textarea id="customPrompt" v-model="memorySettings.customPrompt" rows="10" />
              </FormField>
            </FormView>
          </Panel>
          <Panel header="高级设置" toggleable>
            <FormView>
              <FormField>
                <Textarea id="customConfig" v-model="advancedMemorySettings" rows="10" />
              </FormField>
            </FormView>
            <template #footer>
              <div class="panel_footer">
                <SVGHelp
                  class="cursor-pointer"
                  color="#64748B"
                  width="1.5rem"
                  height="1.5rem"
                  @click="showAdvancedSettingsDialog = true"
                />
                <Button label="应用" @click="applyAdvancedMemorySettings" />
              </div>
            </template>
          </Panel>
        </template>
      </ScrollView>
    </div>
  </div>

  <Dialog
    v-model:visible="showAdvancedSettingsDialog"
    modal
    header="高级设置"
    :style="{ height: '85vh', width: '90vw' }"
    :draggable="false"
  >
    <MarkdownArea :markdown="advancedSettingsHelp" />
  </Dialog>

  <ContextMenu ref="contextMenu" :model="modelTypeMenuItems" />
</template>

<script setup lang="ts" name="ModelSettingsView">
// VUE
import { ref, watch, onMounted, toRaw } from 'vue'
// SVG
import SVGHelp from '@/svg/SVGHelp.vue'
import SVGBrain from '@/svg/SVGBrain.vue'
import SVGRefresh from '@/svg/SVGRefresh.vue'
// Components
import FormView from '@/components/General/FormView.vue'
import OpenLink from '@/components/General/OpenLink.vue'
import FormField from '@/components/General/FormField.vue'
import ScrollView from '@/components/General/ScrollView.vue'
import MarkdownArea from '@/components/General/MarkdownArea.vue'
// Scripts
import { Provider, Model } from '&/provider'
import { providers } from '&/config/providers'
import { MemoryConfig } from 'mem0ai-nosqlite/oss'
// PrimeVue
import {
  Panel,
  Password,
  InputText,
  InputGroup,
  InputGroupAddon,
  Button,
  useToast,
  ContextMenu,
  Select,
  ToggleSwitch,
  Textarea,
  InputNumber,
  Dialog,
} from 'primevue'
import { MenuItem } from 'primevue/menuitem'

const toast = useToast()

const providersRef = ref(providers)
const selectedProvider = ref<Provider | undefined>(
  (await window.api.providerManager.ipcGetAllProviders())[0],
)
const selectedProviderModels = ref<Model[]>([])

// Right-click context menu
const contextMenu = ref<InstanceType<typeof ContextMenu> | null>(null)
const selectedModel = ref<Model | null>(null)

const modelTypeMenuItems = ref<MenuItem[]>([
  {
    label: '修改类型',
    items: [
      {
        label: '对话',
        command: () => updateModelType('chat'),
      },
      {
        label: '推理',
        command: () => updateModelType('reasoning'),
      },
      {
        label: '嵌入',
        command: () => updateModelType('embedding'),
      },
      {
        label: '其他',
        command: () => updateModelType('other'),
      },
    ],
  },
])

async function updateModelType(type: Model['type']) {
  if (!selectedModel.value || !selectedProvider.value) return

  try {
    selectedModel.value.type = type

    await window.api.providerManager.ipcUpdateModel(
      selectedProvider.value.id,
      selectedModel.value.id,
      { type },
    )
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: '修改失败',
      detail: (error as Error).message,
    })
  } finally {
    selectedModel.value = null
  }
}

function onModelRightClick(event: MouseEvent, model: Model) {
  selectedModel.value = model
  contextMenu.value?.show(event)
}

async function selectProvider(providerId: string | null) {
  selectedProvider.value = providerId
    ? await window.api.providerManager.ipcGetProvider(providerId)
    : undefined
  selectedProviderModels.value = providerId
    ? await window.api.providerManager.ipcGetModelsByProviderId(providerId)
    : []
}

const vectorStoreProviders = [
  'qdrant',
  'redis',
  'supabase',
  'langchain',
  'vectorize',
  'pgvector',
  'azure-ai-search',
]
const embedderProviders = ['langchain', 'openai', 'ollama', 'google', 'gemini', 'azure_openai']
const llmProviders = [
  'openai',
  'openai_structured',
  'anthropic',
  'groq',
  'ollama',
  'google',
  'gemini',
  'azure_openai',
  'mistral',
  'langchain',
]
const historyProviders = ['memory', 'supabase']
const graphProviders = ['neo4j']

const memorySettings = ref<Partial<MemoryConfig>>(await window.api.memoryManager.ipcGetConfig())
const advancedMemorySettings = ref<string>(
  await window.api.memoryManager.ipcGetCustomConfigString(),
)

function applyAdvancedMemorySettings() {
  window.api.memoryManager
    .ipcUpdateConfigByJSONString(advancedMemorySettings.value)
    .then(() => {
      toast.add({
        severity: 'success',
        summary: '应用成功',
        life: 2000,
      })
    })
    .catch((error) => {
      toast.add({
        severity: 'error',
        summary: '应用失败',
        detail: error.message,
      })
    })
}

async function testConnection() {
  if (!selectedProvider.value) {
    toast.add({
      severity: 'error',
      summary: '连接错误',
      detail: '未选择提供商',
    })
    return
  }

  await fetch(`${selectedProvider.value.url}/v1/models`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${selectedProvider.value.apiKey}`,
    },
  })
    .then(async (response) => {
      if (response.ok) {
        await response.json()
        toast.add({
          severity: 'success',
          summary: '连接成功',
          life: 3000,
        })
      } else {
        const data = await response.json()
        toast.add({
          severity: 'error',
          summary: '连接失败',
          detail: data.error?.message,
        })
      }
    })
    .catch((error) => {
      toast.add({
        severity: 'error',
        summary: '连接错误',
        detail: error.message,
      })
    })
}

async function refreshModel() {
  try {
    if (!selectedProvider.value) throw new Error('未选择提供商')

    const provider = selectedProvider.value

    const response = await fetch(`${provider.url}/v1/models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${provider.apiKey}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      const models = data.data.map((model: Record<string, unknown>) => ({
        id: model.id as string,
        object: model.object as string,
        owned_by: model.owned_by as string,
        provider: provider.id,
      }))

      for (const model of models) {
        const existingModel = await window.api.providerManager.ipcGetModel(provider.id, model.id)
        if (existingModel) {
          model.type = existingModel.type
        } else {
          if (model.id.includes('embed')) {
            model.type = 'embedding'
          } else if (model.id.includes('reason') || model.id.includes('think')) {
            model.type = 'reasoning'
          } else if (
            model.id.includes('translate') ||
            model.id.includes('tts') ||
            model.id.includes('ocr') ||
            model.id.includes('image')
          ) {
            model.type = 'other'
          } else {
            model.type = 'chat'
          }
        }
      }

      selectedProviderModels.value = models

      toast.add({
        severity: 'success',
        summary: '模型列表刷新成功',
        life: 3000,
      })
    } else {
      selectedProviderModels.value = []
      const data = await response.json()
      toast.add({
        severity: 'error',
        summary: '模型列表刷新失败',
        detail: data.error?.message,
      })
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: '模型列表刷新错误',
      detail: (error as Error).message,
    })
  }
}

function getModelTypeName(model: Model): string {
  switch (model.type) {
    case 'chat':
      return '对话'
    case 'embedding':
      return '嵌入'
    case 'reasoning':
      return '推理'
    default:
      return '其他'
  }
}

onMounted(async () => {
  await selectProvider(providers[0].id)
})

watch(
  () => memorySettings.value,
  (newValue) => {
    newValue.embedder!.embeddingDims = newValue.vectorStore?.dimension
    window.api.memoryManager.ipcUpdateConfig(toRaw(newValue))
  },
  { deep: true },
)

watch(
  () => selectedProvider.value?.apiKey || '',
  (newValue) => {
    if (!selectedProvider.value) return
    window.api.providerManager.ipcSetApiKey(selectedProvider.value?.id, newValue)
  },
)

watch(
  () => selectedProvider.value?.url,
  (newValue) => {
    if (!selectedProvider.value) return
    window.api.providerManager.ipcSetUrl(selectedProvider.value?.id, newValue || '')
  },
)

watch(
  () => selectedProviderModels.value,
  (newValue) => {
    if (!selectedProvider.value) return
    window.api.providerManager.ipcSetModelsByProviderId(selectedProvider.value?.id, toRaw(newValue))
  },
  { deep: true },
)

const showAdvancedSettingsDialog = ref(false)
const advancedSettingsHelp = `\`\`\`typescript
{
    version?: string | undefined;
    embedder: {
        provider: "langchain" | "openai" | "ollama" | "google" | "gemini" | "azure_openai";
        baseURL?: string | undefined;
        apiKey?: string | undefined;
        model?: any;
        embeddingDims?: number | undefined;
        modelProperties?: {
            [x: string]: any;
        } | undefined;
    };
    vectorStore: {
        [key: string]: any;
        provider: "qdrant" | "redis" | "supabase" | "langchain" | "vectorize" | "pgvector" | "azure-ai-search";
        collectionName?: string | undefined;
        dimension?: number | undefined;
        client?: any;
    };
    llm: {
        provider: "langchain" | "openai" | "ollama" | "google" | "gemini" | "azure_openai" | "openai_structured" | "anthropic" | "groq" | "mistral";
        baseURL?: string | undefined;
        apiKey?: string | undefined;
        model?: any;
        modelProperties?: {
            [x: string]: any;
        } | undefined;
    };
    historyStore: {
        provider: "supabase" | "memory";
        historyDbPath?: string | undefined;
        supabaseUrl?: string | undefined;
        supabaseKey?: string | undefined;
        tableName?: string | undefined;
    };
    historyDbPath?: string;
    enableGraph?: boolean;
    disableHistory?: boolean;
    graphStore: {
        provider: "neo4j";
        config: {
            url: string;
            username: string;
            password: string;
        };
        llm?: {
            provider: "langchain" | "openai" | "ollama" | "google" | "gemini" | "azure_openai" | "openai_structured" | "anthropic" | "groq" | "mistral";
            baseURL?: string | undefined;
            apiKey?: string | undefined;
            model?: any;
            modelProperties?: {
                [x: string]: any;
            } | undefined;
        } | undefined;
        customPrompt?: string | undefined;
    };
    customPrompt?: string | undefined;
}
\`\`\``
</script>

<style scoped>
.models_settings {
  display: flex;
  height: 100%;
}

.models_sidebar {
  height: 100%;
  width: 250px;
  border-right: var(--default-border-1);
}

.memory_model_container {
  padding: calc(var(--scroll-bar-width) + 4px);
}

.providers {
  height: calc(100% - var(--scroll-bar-width) * 2 - 68px);
  width: 100%;
}

.provider_item {
  width: 100%;
  height: 60px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #000000;
  transition: all 0.2s ease-in-out;
  padding-left: 16px;
  justify-content: flex-start;

  border-radius: var(--settings-model-tab-border-radius);

  &.on {
    background-color: var(--settings-model-tab-color-on);
  }

  &:hover {
    background-color: var(--settings-model-tab-color-hover);
  }

  &:active {
    background-color: var(--settings-model-tab-color-active);
  }

  svg {
    margin-right: 8px;
  }
}

.provider_icon {
  width: 2rem;
  height: 2rem;
  margin-right: 14px;
  border-radius: 8px;
  border: solid 1px #e0e0e0;
  display: flex;
}

.models_content {
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
}

.content_header {
  padding: 24px;
  background-color: #ffffff;
  border-bottom: var(--default-border-1);
  display: flex;
  align-items: center;
  gap: 16px;
}

.content_header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
}

.panel_footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
}

.models_grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.model_card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background-color: #ffffff;
  transition: all 0.2s ease;
}

.model_card:hover {
  border-color: var(--p-primary-500);
  box-shadow: 0 4px 12px #00000014;
}

.model_header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.model_name {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  flex: 1;
  word-break: break-word;
  margin-right: 12px;
}

.model_type {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;

  &.chat {
    background-color: #e3f2fd;
    color: #1976d2;
  }

  &.reasoning {
    background-color: #e8f5e9;
    color: #2e7d32;
  }

  &.embedding {
    background-color: #f3e5f5;
    color: #7b1fa2;
  }

  &.other {
    background-color: #eeeeee;
    color: #616161;
  }
}
</style>

<style>
:root {
  --settings-model-tab-border-radius: 5px;

  --settings-model-tab-color-on: #00000016;
  --settings-model-tab-color-hover: #00000024;
  --settings-model-tab-color-active: #00000032;
}
</style>
