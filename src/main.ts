import { createApp } from 'vue'
import { router } from './router/index'
import { createPinia } from 'pinia'

import { scrollActive } from './scripts/ui/scrollActive'
import { hideWhenZero } from './scripts/ui/hideWhenZero'

import { definePreset } from '@primeuix/themes'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import ToastService from 'primevue/toastservice'
import Tooltip from 'primevue/tooltip'

import App from './App.vue'

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
    splitter: {
      root: {
        borderColor: 'none',
      },
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
