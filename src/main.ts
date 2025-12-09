import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { router } from './router/index'

import { scrollActive } from './scripts/ui/scrollActive'
import { hideWhenZero } from './scripts/ui/hideWhenZero'

import Tooltip from 'primevue/tooltip'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import { definePreset } from '@primeuix/themes'
import ToastService from 'primevue/toastservice'

import App from './App.vue'

import { IpcServices } from '#/ipc'
import { createIpcProxy } from 'electron-ipc-decorator/client'

window.api = createIpcProxy<IpcServices>(window.ipcRenderer)!

const PrimeVuePreset = definePreset(Aura, {
  semantic: {
    primary: {
      0: '#ffffff',
      50: '{sky.50}',
      100: '{sky.100}',
      200: '{sky.200}',
      300: '{sky.300}',
      400: '{sky.400}',
      500: '{sky.500}',
      600: '{sky.600}',
      700: '{sky.700}',
      800: '{sky.800}',
      900: '{sky.900}',
      950: '{sky.950}',
    },
  },
  components: {
    avatar: {
      root: {
        width: '2rem',
        height: '2rem',
      },
      lg: {
        width: '2.5rem',
        height: '2.5rem',
      },
      xl: {
        width: '3rem',
        height: '3rem',
      },
      css: () => `
      .p-avatar {
        img {
          -webkit-user-drag: none;
        }
      }

      .p-avatar-image {
        background: var(--p-avatar-background);
      }`,
    },
    overlaybadge: {
      css: () => `
      .p-overlaybadge {
        line-height: 1rem;
        display: inline-flex;
      }`,
    },
    panel: {
      css: () => `
      .p-panel {
        box-shadow: 0 4px 12px #00000014;
      }

      .p-panel .p-panel-header:has(.p-panel-header-actions:not(:empty)) {
        padding: 0.396rem 1.125rem !important;
      }`,
    },
    password: {
      css: () => `
      .p-password input {
        width: 100%;
      }

      .p-password-mask-icon,
      .p-password-unmask-icon {
        cursor: pointer;
      }`,
    },
    select: {
      list: {
        header: {
          padding: '1rem 1rem 0 1rem',
        },
      },
      css: () => `
      .p-select-label {
        padding-right: 0 !important;
      }`,
    },
    splitter: {
      root: {
        borderColor: 'none',
      },
    },
    toast: {
      css: () => `
      .p-toast {
        top: 36px !important;
      }

      .p-toast-message-icon {
        margin-top: 1.5px;
      }

      .p-toast-close-button {
        top: 3.5px;
      }`,
    },
  },
})

createApp(App)
  .directive('scrollActive', scrollActive)
  .directive('hideWhenZero', hideWhenZero)
  .directive('tooltip', Tooltip)
  .use(router)
  .use(createPinia())
  .use(PrimeVue, {
    theme: {
      preset: PrimeVuePreset,
    },
  })
  .use(ToastService)
  .mount('#app')
