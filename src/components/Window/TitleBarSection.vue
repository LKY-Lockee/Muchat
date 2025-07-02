<template>
  <div class="title_bar_section_container">
    <slot />
  </div>
</template>

<script setup lang="ts" name="TitleBarSection">
defineProps({
  width: {
    type: String,
    default: 'auto',
  },
})
</script>

<style scoped>
.title_bar_section_container {
  height: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1px;
  width: v-bind(width);
  min-width: v-bind(width);
  max-width: v-bind(width);

  &[left] {
    justify-content: flex-start;
  }

  &[center] {
    justify-content: center;
  }

  &[right] {
    justify-content: flex-end;
  }
}
</style>
