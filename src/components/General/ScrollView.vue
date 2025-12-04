<template>
  <div ref="scrollContainer" class="scroll_bar_overlay" v-scrollActive>
    <div
      class="scroll_view_content"
      :style="
        {
          padding: props.padding,
          display: props.display,
          flexDirection: props.flexDirection,
          gap: props.gap,
        } as CSSProperties
      "
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts" name="ScrollView">
// VUE
import { ref, type CSSProperties } from 'vue'

const props = defineProps({
  padding: {
    type: String,
    default: '0',
  },
  display: {
    type: String,
    default: 'flex',
  },
  flexDirection: {
    type: String,
    default: 'column',
  },
  gap: {
    type: String,
    default: '0px',
  },
})

const scrollContainer = ref<HTMLDivElement | null>(null)

const scrollToTop = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = 0
  }
}

const scrollToBottom = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
  }
}

const isAtTop = () => scrollContainer.value?.scrollTop == 0

const isAtBottom = () => {
  if (!scrollContainer.value) return false
  return Math.abs(scrollContainer.value.scrollTop - scrollContainer.value.scrollHeight) <= 800
}

defineExpose({
  scrollToTop,
  scrollToBottom,
  isAtTop,
  isAtBottom,
})
</script>

<style scoped>
.scroll_bar_overlay {
  overflow-y: scroll !important;
}

.scroll_view_content {
  box-sizing: border-box;
}
</style>
