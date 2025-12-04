<template>
  <div class="settings_container">
    <ScrollView class="settings_sidebar" padding="15px 4px" gap="8px">
      <RouterLink
        v-for="category in settingCategories"
        :key="category.id"
        :to="{ path: `/settings/${category.route}` }"
        v-slot="{ isActive }"
      >
        <div class="nav_item no-select" :class="{ on: isActive }">
          <component :is="category.icon" width="22" height="22" />
          <span>{{ category.name }}</span>
        </div>
      </RouterLink>
    </ScrollView>

    <AnimatedRouterView :level="1" />
  </div>
</template>

<script setup lang="ts" name="SettingsView">
// VUE
import { markRaw, ref } from 'vue'
// SVG
import SVGAgent from '@/svg/SVGAgent.vue'
import SVGAbout from '@/svg/SVGAbout.vue'
// Components
import ScrollView from '@/components/General/ScrollView.vue'
import AnimatedRouterView from '@/components/Window/AnimatedRouterView.vue'

const settingCategories = ref([
  {
    id: 'models',
    name: '模型设置',
    route: 'models',
    icon: markRaw(SVGAgent),
  },
  {
    id: 'about',
    name: '关于',
    route: 'about',
    icon: markRaw(SVGAbout),
  },
])
</script>

<style scoped>
.settings_container {
  display: flex;
  height: 100%;
}

.settings_sidebar {
  width: 240px;
  border-right: var(--default-border-1);
  display: flex;
  flex-direction: column;
}

.nav_item {
  width: 100%;
  height: 45px;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #000000;
  transition: all 0.2s ease-in-out;
  padding-left: 16px;
  justify-content: flex-start;

  border-radius: var(--settings-tab-border-radius);

  &.on {
    background-color: var(--settings-tab-color-on);
  }

  &:hover {
    background-color: var(--settings-tab-color-hover);
  }

  &:active {
    background-color: var(--settings-tab-color-active);
  }

  svg {
    margin-right: 8px;
  }
}
</style>

<style>
:root {
  --settings-tab-border-radius: 5px;

  --settings-tab-color-on: #00000016;
  --settings-tab-color-hover: #00000024;
  --settings-tab-color-active: #00000032;
}
</style>
