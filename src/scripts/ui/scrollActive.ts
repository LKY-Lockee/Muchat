import type { Directive } from 'vue'
import { debounce } from 'ts-debounce'

export const scrollActive: Directive = {
  mounted(el, binding) {
    try {
      const selector = binding.value?.selector
      if (selector) {
        el = el.querySelector(selector) || el
      }
      const hideScroll = debounce((el) => {
        el.classList.add('dom-scrollbar-hide')
        el.classList.remove('dom-scrollbar-show')
      }, 3000)
      el.classList.add('dom-scrollbar-hide')
      el.addEventListener('scroll', function () {
        if (Array.from(el.classList).includes('dom-scrollbar-show')) {
          hideScroll(el)
          return
        }
        el.classList.add('dom-scrollbar-show')
        el.classList.remove('dom-scrollbar-hide')
      })
    } catch {
      /* empty */
    }
  },
  unmounted(element, binding) {
    let el = element
    if (el) {
      const selector = binding.value?.selector
      if (selector) {
        el = element.querySelector(selector) || element
      }
      el.removeEventListener('scroll', () => {})
    }
  },
}
