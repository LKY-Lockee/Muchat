<template>
  <div class="title_bar_padding app-draggable"></div>
</template>

<script setup lang="ts" name="TitleBarPadding">
const props = defineProps({
  color: {
    type: String,
    default: 'transparent',
  },
})
</script>

<style scoped>
.title_bar_padding {
  width: 100%;

  height: calc(var(--title-bar-height) + 1px);
  min-height: calc(var(--title-bar-height) + 1px);
  max-height: calc(var(--title-bar-height) + 1px);
  background: v-bind('props.color');
}
</style>
