import { DirectiveBinding } from 'vue'

function updateBadgeVisibility(el: HTMLElement, value: number) {
  const badgeElement = el.querySelector('.p-overlaybadge .p-badge')

  if (badgeElement) {
    if (value === 0) {
      ;(badgeElement as HTMLElement).style.display = 'none'
    } else {
      ;(badgeElement as HTMLElement).style.display = ''
    }
  }
}

export const hideWhenZero = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    updateBadgeVisibility(el, binding.value)
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    updateBadgeVisibility(el, binding.value)
  },
}
