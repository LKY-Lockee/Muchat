<template>
  <svg
    :t="props.t"
    :viewBox="props.viewBox"
    :version="props.version"
    :p-id="props['p-id']"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    :width="props.width"
    :height="props.height"
  >
    <slot />
  </svg>
</template>

<script setup lang="ts" name="SVG">
const props = defineProps({
  t: String,
  viewBox: String,
  version: String,
  'p-id': String,
  width: {
    type: String,
    default: '200',
  },
  height: {
    type: String,
    default: '200',
  },
  color: {
    type: String,
    default: '#000000',
  },
})
</script>

<style scoped>
svg * {
  fill: v-bind('props.color');
}
</style>
