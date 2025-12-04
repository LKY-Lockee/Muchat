<template>
  <div class="title_bar_button app-no-drag">
    <slot />
  </div>
</template>

<script setup lang="ts" name="TitleBarButton"></script>

<style scoped>
.title_bar_button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44.5px;
  height: 100%;
  user-select: none;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  pointer-events: auto;

  &[square] {
    width: calc(var(--title-bar-height) - 8px);
    height: calc(var(--title-bar-height) - 8px);
    margin: 4px;
    border-radius: 5px;
  }
}

.title_bar_button:hover {
  background-color: #0000001a;
}

.title_bar_button:active {
  background-color: #00000033;
}
</style>
