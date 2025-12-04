import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/chat',
    },
    {
      path: '/chat',
      component: () => import('@/views/ChatView.vue'),
      children: [
        {
          path: '',
          redirect: '/chat/messages',
        },
        {
          path: 'messages',
          component: () => import('@/views/ChatView/MessagesView.vue'),
        },
        {
          path: 'friends',
          component: () => import('@/views/ChatView/FriendsView.vue'),
        },
      ],
    },
    {
      path: '/settings',
      component: () => import('@/views/SettingsView.vue'),
      children: [
        {
          path: '',
          redirect: '/settings/models',
        },
        {
          path: 'models',
          component: () => import('@/views/SettingsView/ModelSettingsView.vue'),
        },
        {
          path: 'about',
          component: () => import('@/views/SettingsView/AboutView.vue'),
        },
      ],
    },
  ],
})
