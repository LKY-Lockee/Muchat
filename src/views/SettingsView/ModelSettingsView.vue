<template>
  <div class="models_settings">
    <ScrollView
      class="models_sidebar"
      padding-top-bottom="15px"
      padding-left-right="11px"
      gap="10px"
    >
      <div
        v-for="provider in providersRef"
        :key="provider.id"
        class="button left-border provider_item"
        :class="{ on: selectedProvider.id === provider.id }"
        @click="selectProvider(provider.id)"
      >
        <img :src="provider.icon" class="provider_icon" />
        <div>{{ provider.name }}</div>
      </div>
    </ScrollView>
    <div class="models_content">
      <div class="content_header">
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
      </div>
      <ScrollView padding-top-bottom="24px" padding-left-right="20px" gap="20px">
        <Panel header="API 设置">
          <div class="form_grid">
            <div class="form_group">
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
            </div>

            <div class="form_group">
              <label for="url">API 地址</label>
              <InputText v-model="selectedProvider.url" />
            </div>
          </div>
        </Panel>
        <Panel header="模型">
          <div class="models_grid">
            <div v-for="model in selectedProvider.models" :key="model.id" class="model_card">
              <div class="model_header">
                <h4 class="model_name">{{ model.id }}</h4>
                <span
                  class="model_type"
                  :class="{
                    embedding: model.id.includes('embedding'),
                    chat: !model.id.includes('embedding'),
                  }"
                >
                  {{ model.id.includes('embedding') ? '嵌入' : '对话' }}
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
      </ScrollView>
    </div>
  </div>
</template>

<script setup lang="ts" name="ModelSettingsView">
import SVGRefresh from '@/svg/SVGRefresh.vue'
import { ref, watch, onMounted } from 'vue'
import providers, { type Provider } from '@/config/providers'
import providerManager from '@/scripts/store/providerManager'
import { Panel, Password, InputText, InputGroup, InputGroupAddon, Button, useToast } from 'primevue'
import ScrollView from '@/components/General/ScrollView.vue'
import OpenLink from '@/components/General/OpenLink.vue'
import type { Model } from 'openai/resources/index.mjs'

const toast = useToast()

const providersRef = ref(providers)
const selectedProvider = ref<Provider>(providerManager.getAllProviders()[0])

let saveTimeout: ReturnType<typeof setTimeout> | null = null
function debouncedSave(
  providerId: string,
  field: keyof Provider,
  value: string | null | undefined,
) {
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }
  saveTimeout = setTimeout(() => {
    providerManager.setStoredValue(providerId, field, value)
  }, 500)
}

function selectProvider(providerId: string) {
  selectedProvider.value = providerManager.getProvider(providerId)
}

async function testConnection() {
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
    const response = await fetch(`${selectedProvider.value.url}/v1/models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${selectedProvider.value.apiKey}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      const models = data.data.map((model: Model) => ({
        ...model,
        provider: selectedProvider.value.id,
      }))
      selectedProvider.value.models = models

      toast.add({
        severity: 'success',
        summary: '模型列表刷新成功',
        life: 3000,
      })
    } else {
      selectedProvider.value.models = []
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

onMounted(() => {
  selectProvider(providers[0].id)
})

watch(
  () => selectedProvider.value.apiKey || '',
  (newValue) => {
    debouncedSave(selectedProvider.value.id, 'apiKey', newValue)
  },
)

watch(
  () => selectedProvider.value.url,
  (newValue) => {
    debouncedSave(selectedProvider.value.id, 'url', newValue)
  },
)

watch(
  () => selectedProvider.value.models,
  (newValue) => {
    debouncedSave(selectedProvider.value.id, 'models', JSON.stringify(newValue))
  },
)
</script>

<style scoped>
.models_settings {
  display: flex;
  height: 100%;
}

.models_sidebar {
  height: 100%;
  width: 250px;
  border-right: 1px solid #dddddd;
}

.provider_item {
  height: 60px;
  padding: 12px 14px;
  justify-content: flex-start;
}

.provider_icon {
  width: 36px;
  height: 36px;
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
  border-bottom: 1px solid #dddddd;
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

.form_grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form_group {
  display: flex;
  flex-direction: column;
}

.form_group label {
  margin-bottom: 6px;
  font-weight: 500;
  color: #1a1a1a;
  font-size: 0.9rem;
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
  border-color: var(--theme-blue);
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

  &.embedding {
    background-color: #f3e5f5;
    color: #7b1fa2;
  }
}
</style>
