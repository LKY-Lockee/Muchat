<template>
  <div class="title_bar_area hide-in-transition">
    <slot />
  </div>
</template>

<script setup lang="ts" name="TitleBarArea"></script>

<style scoped>
.title_bar_area {
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  width: 100%;
  padding-right: 138px;

  height: var(--title-bar-height);
  padding-left: var(--sidebar-width);
}
</style>
