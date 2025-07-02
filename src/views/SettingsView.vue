<template>
  <div class="settings_container">
    <ScrollView
      class="settings_sidebar"
      padding-top-bottom="15px"
      padding-left-right="11px"
      gap="10px"
    >
      <RouterLink
        v-for="category in settingCategories"
        :key="category.id"
        :to="{ path: `/settings/${category.route}` }"
        v-slot="{ isActive }"
      >
        <div class="nav_item" :class="{ on: isActive }">
          <component :is="category.icon" width="22" height="22" />
          <span>{{ category.name }}</span>
        </div>
      </RouterLink>
    </ScrollView>

    <AnimatedRouterView :level="1" />
  </div>
</template>

<script setup lang="ts" name="SettingsView">
import SVGAgent from '@/svg/SVGAgent.vue'
import SVGAbout from '@/svg/SVGAbout.vue'

import AnimatedRouterView from '@/components/Window/AnimatedRouterView.vue'
import ScrollView from '@/components/General/ScrollView.vue'
import { markRaw, ref } from 'vue'

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
  border-right: 1px solid #dddddd;
  display: flex;
  flex-direction: column;
}

.nav_item {
  width: 100%;
  height: 45px;
  border: solid 1px transparent;
  border-radius: 8px;
  box-sizing: border-box;
  user-select: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #000000;
  transition-property: background-color border box-shadow;
  transition-duration: 0.15s;
  transition-timing-function: ease-in-out;

  padding-left: 16px;
  justify-content: flex-start;

  &.on {
    background-color: #ffffff !important;
    border: solid 1px #e0e0e0;
    box-shadow: 0 4px 12px #00000014;
  }

  &.bottom-border.on {
    border: solid 1px #e0e0e0;
    border-bottom: solid 3px var(--theme-blue);
  }

  &.left-border.on {
    border: solid 1px #e0e0e0;
    border-left: solid 3px var(--theme-blue);
  }

  &:hover {
    background-color: #fafafa !important;
    box-shadow: 0 4px 12px #00000014;
  }

  &.left-border:hover {
    border-left: solid 2px var(--theme-orange);
  }

  &.bottom-border:hover {
    border-bottom: solid 2px var(--theme-orange);
  }

  &:active {
    background-color: #f2f2f2 !important;
    box-shadow: 0 6px 16px #0000001a;
  }

  &.left-border:active {
    border-left: solid 4px var(--theme-orange);
  }

  &.bottom-border:active {
    border-bottom: solid 4px var(--theme-orange);
  }

  svg {
    margin-right: 8px;
  }
}
</style>
