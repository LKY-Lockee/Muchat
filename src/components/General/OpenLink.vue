<template>
  <a :href="props.href" target="_blank" style="display: flex">
    <SVGOpen :color="props.color" :width="props.width" :height="props.height" />
  </a>
</template>

<script setup lang="ts" name="OpenLink">
import SVGOpen from '@/svg/SVGOpen.vue'

const props = defineProps({
  href: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: '#aaaaaa',
  },
  width: {
    type: String,
    default: '20',
  },
  height: {
    type: String,
    default: '20',
  },
})
</script>

<style scoped></style>
