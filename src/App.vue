<template>
  <Toast />
  <BorderedWindow>
    <SideBar class="app-draggable">
      <template #title>
        <SVGIcon width="1.5rem" height="2.2rem" />
      </template>
      <template #front>
        <RouterLink
          :to="{ path: '/chat/messages' }"
          v-slot="{ isActive }"
          v-tooltip="{
            value: '消息',
            showDelay: 500,
            hideDelay: 500,
          }"
        >
          <SideBarButton :class="{ on: isActive }">
            <SVGChat width="100%" height="100%" />
          </SideBarButton>
        </RouterLink>
        <RouterLink
          :to="{ path: '/chat/friends' }"
          v-slot="{ isActive }"
          v-tooltip="{
            value: '角色',
            showDelay: 500,
            hideDelay: 500,
          }"
        >
          <SideBarButton :class="{ on: isActive }">
            <SVGFriends width="100%" height="100%" />
          </SideBarButton>
        </RouterLink>
      </template>
      <template #end>
        <RouterLink
          :to="{ path: '/settings' }"
          v-slot="{ isActive }"
          v-tooltip="{
            value: '设置',
            showDelay: 500,
            hideDelay: 500,
          }"
        >
          <SideBarButton :class="{ on: isActive }">
            <SVGSettings width="100%" height="100%" />
          </SideBarButton>
        </RouterLink>
      </template>
    </SideBar>
    <AnimatedRouterView :level="0" />
  </BorderedWindow>
</template>

<script setup lang="ts" name="App">
// SVG
import SVGIcon from '@/svg/SVGIcon.vue'
import SVGChat from '@/svg/SVGChat.vue'
import SVGFriends from '@/svg/SVGFriends.vue'
import SVGSettings from '@/svg/SVGSettings.vue'
// Components
import SideBar from '@/components/Window/SideBar.vue'
import SideBarButton from '@/components/Window/SideBarButton.vue'
import BorderedWindow from '@/components/Window/BorderedWindow.vue'
import AnimatedRouterView from '@/components/Window/AnimatedRouterView.vue'
// PrimeVue
import { Toast } from 'primevue'
</script>

<style>
:root {
  --title-bar-height: 36px;
  --scroll-bar-width: 8px;

  --default-border-1: 1px solid #00000016;

  --theme-blue--2: #1b88b7;
  --theme-blue--1: #19a5e1;
  --theme-blue: #38bef9;
  --theme-blue-1: #ecf9fe;
  --theme-blue-2: #fbffff;
  --theme-orange--2: #c47c00;
  --theme-orange--1: #de8900;
  --theme-orange: #f69e0b;
  --theme-orange-1: #fff7ec;
  --theme-orange-2: #fffffb;
}

#app,
body,
html {
  font-family: system-ui, sans-serif, Arial;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
  padding: 0;
  margin: 0;
  width: calc(100vw - 1.5px);
  height: calc(100vh - 1.5px);
  letter-spacing: 0.5px;
}

a {
  -webkit-user-drag: none;
  text-decoration: none;
}

textarea {
  resize: none;
}

/*
 *	Scrollbar
 */

::-webkit-scrollbar {
  width: var(--scroll-bar-width) !important;
  height: var(--scroll-bar-width) !important;
}

::-webkit-scrollbar-thumb {
  background-color: #b0b0b0;
  border-radius: calc(var(--scroll-bar-width) / 2);
}

.dom-scrollbar-hide {
  padding-left: var(--scroll-bar-width);
  padding-right: 0;
}

.dom-scrollbar-show {
  padding-left: var(--scroll-bar-width);
  padding-right: 0;
}

.dom-scrollbar-show::-webkit-scrollbar-thumb {
  background-color: #b0b0b0;
}

.dom-scrollbar-hide::-webkit-scrollbar-thumb {
  background-color: transparent;
}

.hide {
  display: none !important;
}

/*
 *  Global
 */

.app-draggable {
  -webkit-app-region: drag;
}

.app-no-drag {
  -webkit-app-region: no-drag;
}

.no-drag {
  -webkit-user-drag: none;
}

.no-select {
  user-select: none;
}

.column-flex {
  display: flex;
  flex-direction: column;

  &.center-vertical {
    justify-content: center;
  }

  &.center-horizontal {
    align-items: center;
  }

  &.center {
    justify-content: center;
    align-items: center;
  }
}

.row-flex {
  display: flex;
  flex-direction: row;

  &.center-vertical {
    align-items: center;
  }

  &.center-horizontal {
    justify-content: center;
  }

  &.center {
    justify-content: center;
    align-items: center;
  }
}

.full-width {
  width: 100%;
}

.full-height {
  height: 100%;
}

.gap-8 {
  gap: 8px;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
